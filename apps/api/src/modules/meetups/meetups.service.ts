import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  ChatMessageDto,
  MeetupDto,
  MeetupInviteDto,
  MeetupInviteLimitDto,
  MeetupInvitesResponseDto,
  MeetupMatchesResponseDto,
  MeetupRoomDto,
  MeetupRoomMessageDto,
  MeetupRoomMessagesResponseDto,
  MeetupUserSummaryDto,
  NearbyMeetupsResponseDto,
} from '@bitemate/shared';
import { mealFromCategory, meetupCapacity, tagsMatch } from '../../common/dining';
import type {
  FoodMeetup,
  MeetupInvite,
  MeetupRoom,
  User,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ChatService } from '../chat/chat.service';
import { PremiumService } from '../growth/premium.service';
import { NotificationsService } from '../notifications/notifications.service';
import { GamificationService } from '../growth/gamification.service';
import { FraudDetectionService } from '../security/fraud-detection.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { MeetupCacheService } from './meetup-cache.service';
import { MeetupMatchingService } from './meetup-matching.service';
import type { CreateMeetupDto, NearbyMeetupsQueryDto, SendRoomMessageDto } from './dto/meetups.dto';

type MeetupWithCreator = FoodMeetup & {
  creator: UserSummaryFields;
  room: MeetupRoom | null;
};

type UserSummaryFields = Pick<
  User,
  | 'id'
  | 'username'
  | 'fullName'
  | 'profileImage'
  | 'meetupRating'
  | 'meetupReviewCount'
  | 'isPremium'
  | 'rankScore'
>;

type InviteWithRelations = MeetupInvite & {
  meetup: MeetupWithCreator;
  inviter: UserSummaryFields;
  invitee: UserSummaryFields;
};

@Injectable()
export class MeetupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly meetupCache: MeetupCacheService,
    private readonly matchingService: MeetupMatchingService,
    private readonly realtimeGateway: RealtimeGateway,
    @Optional() private readonly chatService: ChatService | null,
    private readonly configService: ConfigService,
    private readonly premiumService: PremiumService,
    private readonly notificationsService: NotificationsService,
    private readonly gamificationService: GamificationService,
    private readonly fraudDetection: FraudDetectionService,
  ) {}

  private chat(): ChatService {
    if (!this.chatService) {
      throw new ServiceUnavailableException('Chat needs MongoDB. Start local Mongo then set SKIP_MONGO=false.');
    }
    return this.chatService;
  }

  async createMeetup(userId: string, dto: CreateMeetupDto): Promise<MeetupDto> {
    await this.fraudDetection.assertMeetupCreateAllowed(userId);
    const scheduledAt = new Date(dto.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      throw new BadRequestException('scheduledAt must be a future date/time');
    }

    const expiresAt = new Date(
      scheduledAt.getTime() +
        this.configService.get<number>('meetup.inviteExpiryHours', 24)! *
          60 *
          60 *
          1000,
    );

    const creator = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        profileImage: true,
        meetupRating: true,
        meetupReviewCount: true,
        isPremium: true,
        rankScore: true,
      },
    });

    const meetup = await this.prisma.foodMeetup.create({
      data: {
        creatorId: userId,
        foodType: dto.foodType.trim(),
        foodCategory: dto.foodCategory?.trim(),
        scheduledAt,
        radiusKm: dto.radiusKm,
        desiredPeople: dto.desiredPeople,
        latitude: dto.latitude,
        longitude: dto.longitude,
        locationLabel: dto.locationLabel?.trim(),
        notes: dto.notes?.trim(),
        mealSlot: dto.mealSlot ?? mealFromCategory(dto.foodCategory),
        foodName: dto.foodName?.trim(),
        preferredGender: dto.preferredGender,
        ageMin: dto.ageMin,
        ageMax: dto.ageMax,
        preferredEducation: dto.preferredEducation,
        country: dto.country?.trim(),
        city: dto.city?.trim(),
        expiresAt,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
            meetupRating: true,
            meetupReviewCount: true,
            isPremium: true,
            rankScore: true,
          },
        },
        room: true,
      },
    });

    await this.meetupCache.cacheActiveMeetup(
      {
        id: meetup.id,
        creatorId: meetup.creatorId,
        foodType: meetup.foodType,
        foodCategory: meetup.foodCategory ?? '',
        scheduledAt: meetup.scheduledAt.toISOString(),
        radiusKm: meetup.radiusKm.toString(),
        desiredPeople: meetup.desiredPeople.toString(),
        latitude: meetup.latitude.toString(),
        longitude: meetup.longitude.toString(),
        status: meetup.status,
        creatorRating: creator.meetupRating.toString(),
      },
      expiresAt,
    );

    return this.toMeetupDto(meetup, 0);
  }

  async getMatches(userId: string, meetupId: string): Promise<MeetupMatchesResponseDto> {
    const meetup = await this.getMeetupForUser(userId, meetupId);
    const items = await this.matchingService.findMatches(meetup, userId);

    const meetupTypeMatches = items.filter((item) => item.matchType === 'MEETUP');
    if (meetupTypeMatches.length) {
      const creatorIds = meetupTypeMatches.map((item) => item.user.id);
      const relatedMeetups = await this.prisma.foodMeetup.findMany({
        where: {
          creatorId: { in: creatorIds },
          status: 'OPEN',
          foodType: { equals: meetup.foodType, mode: 'insensitive' },
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profileImage: true,
              meetupRating: true,
              meetupReviewCount: true,
              isPremium: true,
              rankScore: true,
            },
          },
          room: true,
        },
        orderBy: { scheduledAt: 'asc' },
      });

      const meetupByCreator = new Map<string, MeetupWithCreator>();
      for (const candidate of relatedMeetups) {
        if (!meetupByCreator.has(candidate.creatorId)) {
          meetupByCreator.set(candidate.creatorId, candidate);
        }
      }

      for (const item of items) {
        if (item.matchType === 'MEETUP') {
          const related = meetupByCreator.get(item.user.id);
          if (related) {
            item.meetup = await this.toMeetupDto(related, 0);
          }
        }
      }
    }

    return { meetupId, items };
  }

  async sendInvite(
    userId: string,
    meetupId: string,
    inviteeId: string,
  ): Promise<MeetupInviteDto> {
    if (userId === inviteeId) {
      throw new BadRequestException('Cannot invite yourself');
    }

    const meetup = await this.getMeetupForUser(userId, meetupId);
    if (meetup.creatorId !== userId) {
      throw new ForbiddenException('Only the meetup creator can send invites');
    }
    if (meetup.status === 'FULL' || meetup.status === 'CANCELLED' || meetup.status === 'EXPIRED') {
      throw new BadRequestException('Event is full');
    }
    if (meetup.status !== 'OPEN' && meetup.status !== 'SCHEDULED') {
      throw new BadRequestException('Meetup is not accepting invites');
    }
    const currentAccepted = await this.countAccepted(meetupId);
    if (meetupCapacity(meetup.desiredPeople, currentAccepted).isFull) {
      await this.prisma.foodMeetup.update({
        where: { id: meetupId },
        data: { status: 'FULL' },
      });
      throw new BadRequestException('Event is full');
    }

    const isPremium = await this.premiumService.resolvePremium(userId);

    const dailyLimit = isPremium
      ? this.configService.get<number>('meetup.premiumDailyInviteLimit', 9999)!
      : this.configService.get<number>('meetup.freeDailyInviteLimit', 3)!;

    if (!(isPremium && dailyLimit >= 9999)) {
      const usedToday = await this.meetupCache.getDailyInviteCount(userId);
      if (usedToday >= dailyLimit) {
        throw new BadRequestException(
          isPremium
            ? `Daily invite limit reached (${dailyLimit}).`
            : `Daily invite limit reached (${dailyLimit}). Upgrade to premium for more invites.`,
        );
      }
    }

    const invitee = await this.prisma.user.findFirst({
      where: { id: inviteeId, isActive: true },
    });
    if (!invitee) {
      throw new NotFoundException('Invitee not found');
    }

    const expiresAt = new Date(
      Math.min(
        meetup.expiresAt.getTime(),
        Date.now() +
          this.configService.get<number>('meetup.inviteExpiryHours', 24)! *
            60 *
            60 *
            1000,
      ),
    );

    const invite = await this.prisma.meetupInvite.create({
      data: {
        meetupId,
        inviterId: userId,
        inviteeId,
        expiresAt,
      },
      include: this.inviteInclude(),
    });

    await this.meetupCache.incrementDailyInviteCount(userId);

    const inviteDto = await this.toInviteDto(invite);
    this.realtimeGateway.emitMeetupInvite(inviteeId, inviteDto);

    void this.notificationsService.notify({
      userId: inviteeId,
      type: 'MEETUP_INVITATION',
      title: 'Food meetup invite',
      body: `${invite.inviter.fullName ?? invite.inviter.username ?? 'Someone'} invited you for ${meetup.foodType}`,
      entityId: invite.id,
      dedupeKey: `meetup-invite:${invite.id}`,
      data: {
        meetupId,
        inviteId: invite.id,
        foodType: meetup.foodType,
      },
    });

    return inviteDto;
  }

  async acceptInvite(userId: string, inviteId: string): Promise<MeetupInviteDto> {
    const invite = await this.getInviteForUser(userId, inviteId);
    this.assertInvitePending(invite);
    const alreadyAccepted = await this.countAccepted(invite.meetupId);
    if (
      invite.meetup.status === 'FULL' ||
      meetupCapacity(invite.meetup.desiredPeople, alreadyAccepted).isFull
    ) {
      throw new BadRequestException('Event is full');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const savedInvite = await tx.meetupInvite.update({
        where: { id: inviteId },
        data: { status: 'ACCEPTED', respondedAt: new Date() },
        include: this.inviteInclude(),
      });

      let room = savedInvite.meetup.room;
      if (!room) {
        room = await tx.meetupRoom.create({
          data: { meetupId: savedInvite.meetupId },
        });
        await tx.meetupRoomMember.createMany({
          data: [
            { roomId: room.id, userId: savedInvite.meetup.creatorId },
            { roomId: room.id, userId: savedInvite.inviteeId },
          ],
          skipDuplicates: true,
        });
      } else {
        await tx.meetupRoomMember.upsert({
          where: {
            roomId_userId: { roomId: room.id, userId: savedInvite.inviteeId },
          },
          create: { roomId: room.id, userId: savedInvite.inviteeId },
          update: {},
        });
      }

      const acceptedCount = await tx.meetupInvite.count({
        where: { meetupId: savedInvite.meetupId, status: 'ACCEPTED' },
      });

      const capacity = meetupCapacity(savedInvite.meetup.desiredPeople, acceptedCount);
      if (capacity.isFull) {
        await tx.foodMeetup.update({
          where: { id: savedInvite.meetupId },
          data: { status: 'FULL' },
        });
      } else if (savedInvite.meetup.status === 'OPEN') {
        await tx.foodMeetup.update({
          where: { id: savedInvite.meetupId },
          data: { status: 'SCHEDULED' },
        });
      }

      return tx.meetupInvite.findUniqueOrThrow({
        where: { id: inviteId },
        include: this.inviteInclude(),
      });
    });

    const inviteDto = await this.toInviteDto(updated);

    const roomId = updated.meetup.room?.id;
    if (roomId) {
      const memberIds = await this.prisma.meetupRoomMember.findMany({
        where: { roomId },
        select: { userId: true },
      });
      await this.chat().ensureMeetupGroupChat({
        meetupRoomId: roomId,
        meetupId: updated.meetupId,
        title: updated.meetup.foodType,
        participantIds: memberIds.map((member) => member.userId),
      });
    }

    this.realtimeGateway.emitMeetupInviteAccepted(updated.inviterId, inviteDto);
    if (roomId) {
      this.realtimeGateway.emitRoomMemberJoined(roomId, this.toUserSummary(updated.invitee));
    }

    const inviteeName = updated.invitee.fullName ?? updated.invitee.username ?? 'Someone';
    void this.notificationsService.notify({
      userId: updated.inviterId,
      type: 'MEETUP_ACCEPTED',
      title: 'Invite accepted',
      body: `${inviteeName} accepted your food meetup invite`,
      entityId: updated.id,
      dedupeKey: `meetup-accepted:${updated.id}`,
      data: {
        meetupId: updated.meetupId,
        inviteId: updated.id,
        username: updated.invitee.username,
      },
    });

    void this.gamificationService.recordMeetupParticipation(
      updated.inviteeId,
      updated.meetupId,
      'INVITEE',
    );
    void this.gamificationService.recordMeetupParticipation(
      updated.meetup.creatorId,
      updated.meetupId,
      'CREATOR',
    );

    return inviteDto;
  }

  async rejectInvite(userId: string, inviteId: string): Promise<MeetupInviteDto> {
    const invite = await this.getInviteForUser(userId, inviteId);
    this.assertInvitePending(invite);

    const updated = await this.prisma.meetupInvite.update({
      where: { id: inviteId },
      data: { status: 'REJECTED', respondedAt: new Date() },
      include: this.inviteInclude(),
    });

    const inviteDto = await this.toInviteDto(updated);
    this.realtimeGateway.emitMeetupInviteRejected(updated.inviterId, inviteDto);
    return inviteDto;
  }

  async listMyInvites(userId: string): Promise<MeetupInvitesResponseDto> {
    await this.expireStaleInvites();

    const invites = await this.prisma.meetupInvite.findMany({
      where: { inviteeId: userId, status: 'PENDING' },
      include: this.inviteInclude(),
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      items: await Promise.all(invites.map((invite) => this.toInviteDto(invite))),
    };
  }

  async listMyMeetups(userId: string): Promise<MeetupDto[]> {
    const meetups = await this.prisma.foodMeetup.findMany({
      where: { creatorId: userId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
            meetupRating: true,
            meetupReviewCount: true,
            isPremium: true,
            rankScore: true,
          },
        },
        room: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return Promise.all(
      meetups.map(async (meetup) =>
        this.toMeetupDto(meetup, await this.countAccepted(meetup.id)),
      ),
    );
  }

  async getInviteLimit(userId: string): Promise<MeetupInviteLimitDto> {
    const isPremium = await this.premiumService.resolvePremium(userId);
    const dailyLimit = isPremium
      ? this.configService.get<number>('meetup.premiumDailyInviteLimit', 9999)!
      : this.configService.get<number>('meetup.freeDailyInviteLimit', 3)!;
    const usedToday = await this.meetupCache.getDailyInviteCount(userId);

    return {
      usedToday,
      dailyLimit: isPremium && dailyLimit >= 9999 ? 9999 : dailyLimit,
      isPremium,
    };
  }

  async getRoom(userId: string, roomId: string): Promise<MeetupRoomDto> {
    const room = await this.prisma.meetupRoom.findUnique({
      where: { id: roomId },
      include: {
        meetup: {
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profileImage: true,
                meetupRating: true,
                meetupReviewCount: true,
                isPremium: true,
                rankScore: true,
              },
            },
            room: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profileImage: true,
                meetupRating: true,
                meetupReviewCount: true,
                isPremium: true,
                rankScore: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const isMember = room.members.some((member) => member.userId === userId);
    const isCreator = room.meetup.creatorId === userId;
    if (!isMember && !isCreator) {
      throw new ForbiddenException('Not a member of this room');
    }

    const chat = await this.chat().findChatByMeetupRoomId(room.id);

    return {
      id: room.id,
      meetupId: room.meetupId,
      chatId: chat?.id ?? null,
      status: room.status,
      members: room.members.map((member) => this.toUserSummary(member.user)),
      meetup: await this.toMeetupDto(room.meetup, await this.countAccepted(room.meetupId)),
    };
  }

  async getRoomMessages(
    userId: string,
    roomId: string,
  ): Promise<MeetupRoomMessagesResponseDto> {
    const room = await this.getRoom(userId, roomId);
    if (!room.chatId) {
      return { items: [] };
    }

    const response = await this.chat().getMessages(userId, room.chatId);
    return { items: response.items.map((message) => this.toLegacyRoomMessage(message)) };
  }

  async sendRoomMessage(
    userId: string,
    roomId: string,
    dto: SendRoomMessageDto,
  ): Promise<MeetupRoomMessageDto> {
    const room = await this.getRoom(userId, roomId);
    if (!room.chatId) {
      throw new BadRequestException('Chat is not ready for this meetup room yet');
    }

    const message = await this.chat().sendMessage(userId, {
      chatId: room.chatId,
      type: 'TEXT',
      content: dto.content,
    });

    return this.toLegacyRoomMessage(message);
  }

  private toLegacyRoomMessage(message: ChatMessageDto): MeetupRoomMessageDto {
    return {
      id: message.id,
      roomId: message.chatId,
      content: message.content ?? '',
      createdAt: message.createdAt,
      sender: {
        id: message.sender.id,
        username: message.sender.username,
        fullName: message.sender.fullName,
        profileImage: message.sender.profileImage,
        meetupRating: 0,
        meetupReviewCount: 0,
        isPremium: false,
      },
    };
  }

  private inviteInclude() {
    return {
      meetup: {
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profileImage: true,
              meetupRating: true,
              meetupReviewCount: true,
              isPremium: true,
              rankScore: true,
            },
          },
          room: true,
        },
      },
      inviter: {
        select: {
          id: true,
          username: true,
          fullName: true,
          profileImage: true,
          meetupRating: true,
          meetupReviewCount: true,
          isPremium: true,
          rankScore: true,
        },
      },
      invitee: {
        select: {
          id: true,
          username: true,
          fullName: true,
          profileImage: true,
          meetupRating: true,
          meetupReviewCount: true,
          isPremium: true,
          rankScore: true,
        },
      },
    } as const;
  }

  private async getMeetupForUser(
    userId: string,
    meetupId: string,
  ): Promise<MeetupWithCreator> {
    const meetup = await this.prisma.foodMeetup.findUnique({
      where: { id: meetupId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
            meetupRating: true,
            meetupReviewCount: true,
            isPremium: true,
            rankScore: true,
          },
        },
        room: true,
      },
    });

    if (!meetup) {
      throw new NotFoundException('Meetup not found');
    }

    if (meetup.creatorId !== userId) {
      const membership = meetup.room
        ? await this.prisma.meetupRoomMember.findFirst({
            where: { roomId: meetup.room.id, userId },
          })
        : null;
      if (!membership) {
        throw new ForbiddenException('Not allowed to access this meetup');
      }
    }

    return meetup;
  }

  private async getInviteForUser(
    userId: string,
    inviteId: string,
  ): Promise<InviteWithRelations> {
    const invite = await this.prisma.meetupInvite.findUnique({
      where: { id: inviteId },
      include: this.inviteInclude(),
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.inviteeId !== userId) {
      throw new ForbiddenException('Only the invitee can respond to this invite');
    }

    if (invite.expiresAt <= new Date()) {
      await this.prisma.meetupInvite.update({
        where: { id: inviteId },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Invite has expired');
    }

    return invite;
  }

  private assertInvitePending(invite: InviteWithRelations): void {
    if (invite.status !== 'PENDING') {
      throw new BadRequestException(`Invite is already ${invite.status.toLowerCase()}`);
    }
  }

  private async expireStaleInvites(): Promise<void> {
    await this.prisma.meetupInvite.updateMany({
      where: { status: 'PENDING', expiresAt: { lte: new Date() } },
      data: { status: 'EXPIRED' },
    });
  }

  private async countAccepted(meetupId: string): Promise<number> {
    return this.prisma.meetupInvite.count({
      where: { meetupId, status: 'ACCEPTED' },
    });
  }

  async findNearbyMeetups(
    userId: string,
    query: NearbyMeetupsQueryDto,
  ): Promise<NearbyMeetupsResponseDto> {
    const latDelta = query.radiusKm / 111;
    const cosLat = Math.cos((query.latitude * Math.PI) / 180);
    const lngDelta = query.radiusKm / (111 * Math.max(0.2, Math.abs(cosLat)));

    const meetups = await this.prisma.foodMeetup.findMany({
      where: {
        creatorId: { not: userId },
        status: { in: ['OPEN', 'SCHEDULED', 'FULL'] },
        scheduledAt: { gte: new Date() },
        latitude: {
          gte: query.latitude - latDelta,
          lte: query.latitude + latDelta,
        },
        longitude: {
          gte: query.longitude - lngDelta,
          lte: query.longitude + lngDelta,
        },
        ...(query.mealSlot ? { mealSlot: query.mealSlot } : {}),
        ...(query.country
          ? { country: { equals: query.country, mode: 'insensitive' } }
          : {}),
        ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
        ...(query.gender ? { preferredGender: query.gender } : {}),
        ...(query.education ? { preferredEducation: query.education } : {}),
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
            meetupRating: true,
            meetupReviewCount: true,
            isPremium: true,
            rankScore: true,
          },
        },
        room: true,
      },
      take: 200,
      orderBy: { scheduledAt: 'asc' },
    });

    const items = (
      await Promise.all(
        meetups.map(async (meetup) => {
          const distanceKm =
            Math.round(
              haversineKm(query.latitude, query.longitude, meetup.latitude, meetup.longitude) * 100,
            ) / 100;
          const acceptedCount = await this.countAccepted(meetup.id);
          const dto = await this.toMeetupDto(meetup, acceptedCount);
          return { ...dto, distanceKm };
        }),
      )
    )
      .filter((item) => {
        if (item.distanceKm > query.radiusKm) return false;
        if (query.foodType && !tagsMatch([item.foodType], query.foodType)) return false;
        if (query.foodName && !tagsMatch([item.foodName ?? '', item.foodType], query.foodName)) {
          return false;
        }
        if (query.ageMin != null && item.ageMax != null && item.ageMax < query.ageMin) return false;
        if (query.ageMax != null && item.ageMin != null && item.ageMin > query.ageMax) return false;
        return true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 40);

    return {
      radiusKm: query.radiusKm,
      count: items.length,
      items,
    };
  }

  private async toMeetupDto(
    meetup: MeetupWithCreator,
    acceptedCount: number,
  ): Promise<MeetupDto> {
    const capacity = meetupCapacity(meetup.desiredPeople, acceptedCount);
    const isFull = meetup.status === 'FULL' || capacity.isFull;
    return {
      id: meetup.id,
      foodType: meetup.foodType,
      foodCategory: meetup.foodCategory,
      scheduledAt: meetup.scheduledAt.toISOString(),
      radiusKm: meetup.radiusKm,
      desiredPeople: meetup.desiredPeople,
      latitude: meetup.latitude,
      longitude: meetup.longitude,
      locationLabel: meetup.locationLabel,
      mealSlot: meetup.mealSlot,
      foodName: meetup.foodName,
      preferredGender: meetup.preferredGender,
      ageMin: meetup.ageMin,
      ageMax: meetup.ageMax,
      preferredEducation: meetup.preferredEducation,
      country: meetup.country,
      city: meetup.city,
      status: isFull ? 'FULL' : meetup.status,
      notes: meetup.notes,
      expiresAt: meetup.expiresAt.toISOString(),
      acceptedCount,
      seatsLeft: isFull ? 0 : capacity.seatsLeft,
      isFull,
      creator: this.toUserSummary(meetup.creator),
      roomId: meetup.room?.id ?? null,
      createdAt: meetup.createdAt.toISOString(),
    };
  }

  private async toInviteDto(invite: InviteWithRelations): Promise<MeetupInviteDto> {
    const acceptedCount = await this.countAccepted(invite.meetupId);
    return {
      id: invite.id,
      meetupId: invite.meetupId,
      status: invite.status,
      expiresAt: invite.expiresAt.toISOString(),
      createdAt: invite.createdAt.toISOString(),
      respondedAt: invite.respondedAt?.toISOString() ?? null,
      meetup: await this.toMeetupDto(invite.meetup, acceptedCount),
      inviter: this.toUserSummary(invite.inviter),
      invitee: this.toUserSummary(invite.invitee),
    };
  }

  private toUserSummary(user: UserSummaryFields): MeetupUserSummaryDto {
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      profileImage: user.profileImage,
      meetupRating: user.meetupRating,
      meetupReviewCount: user.meetupReviewCount,
      isPremium: user.isPremium,
    };
  }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
