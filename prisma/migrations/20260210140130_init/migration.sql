-- CreateTable
CREATE TABLE "Mall" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Mall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MallBrand" (
    "id" SERIAL NOT NULL,
    "mallId" INTEGER NOT NULL,
    "brandName" TEXT NOT NULL,
    "redeemUrl" TEXT NOT NULL,
    "matchedStoreName" TEXT NOT NULL,

    CONSTRAINT "MallBrand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MallBrand_mallId_brandName_key" ON "MallBrand"("mallId", "brandName");

-- AddForeignKey
ALTER TABLE "MallBrand" ADD CONSTRAINT "MallBrand_mallId_fkey" FOREIGN KEY ("mallId") REFERENCES "Mall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
