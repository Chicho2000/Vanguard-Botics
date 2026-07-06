ALTER TABLE "parking_spots" ADD COLUMN "assignedUserId" INTEGER;

CREATE UNIQUE INDEX "parking_spots_assignedUserId_key"
ON "parking_spots"("assignedUserId");

ALTER TABLE "parking_spots"
ADD CONSTRAINT "parking_spots_assignedUserId_fkey"
FOREIGN KEY ("assignedUserId") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
