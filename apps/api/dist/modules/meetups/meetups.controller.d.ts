import type { MeetupDto, MeetupInviteDto, MeetupInviteLimitDto, MeetupInvitesResponseDto, MeetupMatchesResponseDto, MeetupRoomDto, MeetupRoomMessageDto, MeetupRoomMessagesResponseDto, NearbyMeetupsResponseDto } from '@bitemate/shared';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CreateMeetupDto, MeetupMatchQueryDto, NearbyMeetupsQueryDto, RespondMeetupInviteDto, SendMeetupInviteDto, SendRoomMessageDto } from './dto/meetups.dto';
import { MeetupsService } from './meetups.service';
export declare class MeetupsController {
    private readonly meetupsService;
    constructor(meetupsService: MeetupsService);
    createMeetup(user: JwtPayload, dto: CreateMeetupDto): Promise<MeetupDto>;
    listMyMeetups(user: JwtPayload): Promise<MeetupDto[]>;
    findNearbyMeetups(user: JwtPayload, query: NearbyMeetupsQueryDto): Promise<NearbyMeetupsResponseDto>;
    getMatches(user: JwtPayload, query: MeetupMatchQueryDto): Promise<MeetupMatchesResponseDto>;
    listMyInvites(user: JwtPayload): Promise<MeetupInvitesResponseDto>;
    getInviteLimit(user: JwtPayload): Promise<MeetupInviteLimitDto>;
    sendInvite(user: JwtPayload, dto: SendMeetupInviteDto): Promise<MeetupInviteDto>;
    acceptInvite(user: JwtPayload, dto: RespondMeetupInviteDto): Promise<MeetupInviteDto>;
    rejectInvite(user: JwtPayload, dto: RespondMeetupInviteDto): Promise<MeetupInviteDto>;
    getRoom(user: JwtPayload, roomId: string): Promise<MeetupRoomDto>;
    getRoomMessages(user: JwtPayload, roomId: string): Promise<MeetupRoomMessagesResponseDto>;
    sendRoomMessage(user: JwtPayload, roomId: string, dto: SendRoomMessageDto): Promise<MeetupRoomMessageDto>;
}
