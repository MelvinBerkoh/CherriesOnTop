import "server-only";
import { ReservationError, reservationTransaction } from "@/lib/reservations";

export async function removePublicEvent(id: string, updatedAt: string) {
  await reservationTransaction(async tx => {
    const event = await tx.publicEvent.findUnique({ where: { id }, select: { updatedAt: true } });
    if (!event || event.updatedAt.toISOString() !== updatedAt) {
      throw new ReservationError("This event changed or was already deleted. Reload before trying again.");
    }
    await tx.dayReservation.deleteMany({ where: { publicEventId: id, kind: "PUBLIC_EVENT" } });
    const removed = await tx.publicEvent.deleteMany({ where: { id, updatedAt: new Date(updatedAt) } });
    if (removed.count !== 1) {
      throw new ReservationError("This event changed. Reload before deleting it.");
    }
  });
}
