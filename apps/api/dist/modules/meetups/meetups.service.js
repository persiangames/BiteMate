"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetupsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const dining_1 = require("../../common/dining");
const prisma_service_1 = require("../database/prisma.service");
const premium_service_1 = require("../growth/premium.service");
const notifications_service_1 = require("../notifications/notifications.service");
const gamification_service_1 = require("../growth/gamification.service");
const fraud_detection_service_1 = require("../security/fraud-detection.service");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
const meetup_cache_service_1 = require("./meetup-cache.service");
const meetup_matching_service_1 = require("./meetup-matching.service");
let MeetupsService = class MeetupsService {
    prisma;
    meetupCache;
    matchingService;
    realtimeGateway;
    chatService;
    configService;
    premiumService;
    notificationsService;
    gamificationService;
    fraudDetection;
    constructor(prisma, meetupCache, matchingService, realtimeGateway, chatService, configService, premiumService, notificationsService, gamificationService, fraudDetection) {
        this.prisma = prisma;
        this.meetupCache = meetupCache;
        this.matchingService = matchingService;
        this.realtimeGateway = realtimeGateway;
        this.chatService = chatService;
        this.configService = configService;
        this.premiumService = premiumService;
        this.notificationsService = notificationsService;
        this.gamificationService = gamificationService;
        this.fraudDetection = fraudDetection;
    }
    chat() {
        if (!this.chatService) {
            throw new common_1.ServiceUnavailableException('Chat needs MongoDB. Start local Mongo then set SKIP_MONGO=false.');
        }
        return this.chatService;
    }
    async createMeetup(userId, dto) {
        await this.fraudDetection.assertMeetupCreateAllowed(userId);
        const scheduledAt = new Date(dto.scheduledAt);
        if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
            throw new common_1.BadRequestException('scheduledAt must be a future date/time');
        }
        const expiresAt = new Date(scheduledAt.getTime() +
            this.configService.get('meetup.inviteExpiryHours', 24) *
                60 *
                60 *
                1000);
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
                mealSlot: dto.mealSlot ?? (0, dining_1.mealFromCategory)(dto.foodCategory),
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
        await this.meetupCache.cacheActiveMeetup({
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
        }, expiresAt);
        return this.toMeetupDto(meetup, 0);
    }
    async getMatches(userId, meetupId) {
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
            const meetupByCreator = new Map();
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
    async sendInvite(userId, meetupId, inviteeId) {
        if (userId === inviteeId) {
            throw new common_1.BadRequestException('Cannot invite yourself');
        }
        const meetup = await this.getMeetupForUser(userId, meetupId);
        if (meetup.creatorId !== userId) {
            throw new common_1.ForbiddenException('Only the meetup creator can send invites');
        }
        if (meetup.status === 'FULL' || meetup.status === 'CANCELLED' || meetup.status === 'EXPIRED') {
            throw new common_1.BadRequestException('Event is full');
        }
        if (meetup.status !== 'OPEN' && meetup.status !== 'SCHEDULED') {
            throw new common_1.BadRequestException('Meetup is not accepting invites');
        }
        const currentAccepted = await this.countAccepted(meetupId);
        if ((0, dining_1.meetupCapacity)(meetup.desiredPeople, currentAccepted).isFull) {
            await this.prisma.foodMeetup.update({
                where: { id: meetupId },
                data: { status: 'FULL' },
            });
            throw new common_1.BadRequestException('Event is full');
        }
        const isPremium = await this.premiumService.resolvePremium(userId);
        const dailyLimit = isPremium
            ? this.configService.get('meetup.premiumDailyInviteLimit', 9999)
            : this.configService.get('meetup.freeDailyInviteLimit', 3);
        if (!(isPremium && dailyLimit >= 9999)) {
            const usedToday = await this.meetupCache.getDailyInviteCount(userId);
            if (usedToday >= dailyLimit) {
                throw new common_1.BadRequestException(isPremium
                    ? `Daily invite limit reached (${dailyLimit}).`
                    : `Daily invite limit reached (${dailyLimit}). Upgrade to premium for more invites.`);
            }
        }
        const invitee = await this.prisma.user.findFirst({
            where: { id: inviteeId, isActive: true },
        });
        if (!invitee) {
            throw new common_1.NotFoundException('Invitee not found');
        }
        const expiresAt = new Date(Math.min(meetup.expiresAt.getTime(), Date.now() +
            this.configService.get('meetup.inviteExpiryHours', 24) *
                60 *
                60 *
                1000));
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
    async acceptInvite(userId, inviteId) {
        const invite = await this.getInviteForUser(userId, inviteId);
        this.assertInvitePending(invite);
        const alreadyAccepted = await this.countAccepted(invite.meetupId);
        if (invite.meetup.status === 'FULL' ||
            (0, dining_1.meetupCapacity)(invite.meetup.desiredPeople, alreadyAccepted).isFull) {
            throw new common_1.BadRequestException('Event is full');
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
            }
            else {
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
            const capacity = (0, dining_1.meetupCapacity)(savedInvite.meetup.desiredPeople, acceptedCount);
            if (capacity.isFull) {
                await tx.foodMeetup.update({
                    where: { id: savedInvite.meetupId },
                    data: { status: 'FULL' },
                });
            }
            else if (savedInvite.meetup.status === 'OPEN') {
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
        void this.gamificationService.recordMeetupParticipation(updated.inviteeId, updated.meetupId, 'INVITEE');
        void this.gamificationService.recordMeetupParticipation(updated.meetup.creatorId, updated.meetupId, 'CREATOR');
        return inviteDto;
    }
    async rejectInvite(userId, inviteId) {
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
    async listMyInvites(userId) {
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
    async listMyMeetups(userId) {
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
        return Promise.all(meetups.map(async (meetup) => this.toMeetupDto(meetup, await this.countAccepted(meetup.id))));
    }
    async getInviteLimit(userId) {
        const isPremium = await this.premiumService.resolvePremium(userId);
        const dailyLimit = isPremium
            ? this.configService.get('meetup.premiumDailyInviteLimit', 9999)
            : this.configService.get('meetup.freeDailyInviteLimit', 3);
        const usedToday = await this.meetupCache.getDailyInviteCount(userId);
        return {
            usedToday,
            dailyLimit: isPremium && dailyLimit >= 9999 ? 9999 : dailyLimit,
            isPremium,
        };
    }
    async getRoom(userId, roomId) {
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
            throw new common_1.NotFoundException('Room not found');
        }
        const isMember = room.members.some((member) => member.userId === userId);
        const isCreator = room.meetup.creatorId === userId;
        if (!isMember && !isCreator) {
            throw new common_1.ForbiddenException('Not a member of this room');
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
    async getRoomMessages(userId, roomId) {
        const room = await this.getRoom(userId, roomId);
        if (!room.chatId) {
            return { items: [] };
        }
        const response = await this.chat().getMessages(userId, room.chatId);
        return { items: response.items.map((message) => this.toLegacyRoomMessage(message)) };
    }
    async sendRoomMessage(userId, roomId, dto) {
        const room = await this.getRoom(userId, roomId);
        if (!room.chatId) {
            throw new common_1.BadRequestException('Chat is not ready for this meetup room yet');
        }
        const message = await this.chat().sendMessage(userId, {
            chatId: room.chatId,
            type: 'TEXT',
            content: dto.content,
        });
        return this.toLegacyRoomMessage(message);
    }
    toLegacyRoomMessage(message) {
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
    inviteInclude() {
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
        };
    }
    async getMeetupForUser(userId, meetupId) {
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
            throw new common_1.NotFoundException('Meetup not found');
        }
        if (meetup.creatorId !== userId) {
            const membership = meetup.room
                ? await this.prisma.meetupRoomMember.findFirst({
                    where: { roomId: meetup.room.id, userId },
                })
                : null;
            if (!membership) {
                throw new common_1.ForbiddenException('Not allowed to access this meetup');
            }
        }
        return meetup;
    }
    async getInviteForUser(userId, inviteId) {
        const invite = await this.prisma.meetupInvite.findUnique({
            where: { id: inviteId },
            include: this.inviteInclude(),
        });
        if (!invite) {
            throw new common_1.NotFoundException('Invite not found');
        }
        if (invite.inviteeId !== userId) {
            throw new common_1.ForbiddenException('Only the invitee can respond to this invite');
        }
        if (invite.expiresAt <= new Date()) {
            await this.prisma.meetupInvite.update({
                where: { id: inviteId },
                data: { status: 'EXPIRED' },
            });
            throw new common_1.BadRequestException('Invite has expired');
        }
        return invite;
    }
    assertInvitePending(invite) {
        if (invite.status !== 'PENDING') {
            throw new common_1.BadRequestException(`Invite is already ${invite.status.toLowerCase()}`);
        }
    }
    async expireStaleInvites() {
        await this.prisma.meetupInvite.updateMany({
            where: { status: 'PENDING', expiresAt: { lte: new Date() } },
            data: { status: 'EXPIRED' },
        });
    }
    async countAccepted(meetupId) {
        return this.prisma.meetupInvite.count({
            where: { meetupId, status: 'ACCEPTED' },
        });
    }
    async findNearbyMeetups(userId, query) {
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
        const items = (await Promise.all(meetups.map(async (meetup) => {
            const distanceKm = Math.round(haversineKm(query.latitude, query.longitude, meetup.latitude, meetup.longitude) * 100) / 100;
            const acceptedCount = await this.countAccepted(meetup.id);
            const dto = await this.toMeetupDto(meetup, acceptedCount);
            return { ...dto, distanceKm };
        })))
            .filter((item) => {
            if (item.distanceKm > query.radiusKm)
                return false;
            if (query.foodType && !(0, dining_1.tagsMatch)([item.foodType], query.foodType))
                return false;
            if (query.foodName && !(0, dining_1.tagsMatch)([item.foodName ?? '', item.foodType], query.foodName)) {
                return false;
            }
            if (query.ageMin != null && item.ageMax != null && item.ageMax < query.ageMin)
                return false;
            if (query.ageMax != null && item.ageMin != null && item.ageMin > query.ageMax)
                return false;
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
    async toMeetupDto(meetup, acceptedCount) {
        const capacity = (0, dining_1.meetupCapacity)(meetup.desiredPeople, acceptedCount);
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
    async toInviteDto(invite) {
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
    toUserSummary(user) {
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
};
exports.MeetupsService = MeetupsService;
exports.MeetupsService = MeetupsService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        meetup_cache_service_1.MeetupCacheService,
        meetup_matching_service_1.MeetupMatchingService,
        realtime_gateway_1.RealtimeGateway, Object, config_1.ConfigService,
        premium_service_1.PremiumService,
        notifications_service_1.NotificationsService,
        gamification_service_1.GamificationService,
        fraud_detection_service_1.FraudDetectionService])
], MeetupsService);
function haversineKm(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
//# sourceMappingURL=meetups.service.js.map