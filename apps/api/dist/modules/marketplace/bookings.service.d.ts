import type { BookingDto, BookingsListResponseDto } from '@bitemate/shared';
import { PrismaService } from '../database/prisma.service';
import { MonetizationService } from '../growth/monetization.service';
import type { CreateBookingDto, UpdateBookingStatusDto } from './dto/marketplace.dto';
export declare class BookingsService {
    private readonly prisma;
    private readonly monetizationService;
    constructor(prisma: PrismaService, monetizationService: MonetizationService);
    createBooking(customerId: string, dto: CreateBookingDto): Promise<BookingDto>;
    listMyBookings(userId: string): Promise<BookingsListResponseDto>;
    updateBookingStatus(userId: string, bookingId: string, dto: UpdateBookingStatusDto): Promise<BookingDto>;
    private createRestaurantBooking;
    private createHomeChefBooking;
    private toBookingDto;
}
