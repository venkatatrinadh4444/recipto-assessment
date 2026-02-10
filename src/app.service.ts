import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.run()
  }

  async run() {
    console.log('Starting mall brand mapping…');

    await this.prisma.mallBrand.deleteMany();
    await this.prisma.mall.deleteMany();

    const malls = this.loadMalls();
    const brands = this.loadBrands();

    for (const mall of malls) {
      const matchedBrands = this.matchBrandsForMall(
        mall.directory,
        brands,
      );

      if (matchedBrands.length === 0) continue;

      const savedMall = await this.prisma.mall.create({
        data: {
          name: mall.Name,
          city: mall.City,
          state: mall.State,
          url: mall.URL,
        },
      });

      for (const brand of matchedBrands) {
        await this.prisma.mallBrand.create({
          data: {
            mallId: savedMall.id,
            brandName: brand.name,
            redeemUrl: brand.redeemUrl,
            matchedStoreName: brand.matchedStore,
          },
        });
      }
    }

    console.log('Mall brand mapping completed');
  }

  loadMalls() {
    const filePath = path.join(
      process.cwd(),
      'data',
      '1252_malls_final.json',
    );

    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  loadBrands() {
    const filePath = path.join(
      process.cwd(),
      'data',
      'Offlinedump-new.csv',
    );

    const csv = fs.readFileSync(filePath, 'utf-8');

    const records = parse(csv, {
      columns: true,
      skip_empty_lines: true,
    });

    return records.map((r:any) => ({
      name: r.name.trim(),
      redeemUrl: r.offline_redeemurl?.trim() ?? '',
      normalized: this.normalize(r.name),
    }));
  }

  // Matching strategy:
   //Normalize store names and brand names
   //Case-insensitive containment match
   //Each brand appears once per mall
  matchBrandsForMall(storeNames: string[], brands: any[]) {
    const results:any = [];
    const matched = new Set<string>();

    for (const store of storeNames) {
      const normalizedStore = this.normalize(store);

      for (const brand of brands) {
        if (matched.has(brand.name)) continue;

        if (normalizedStore.includes(brand.normalized)) {
          matched.add(brand.name);

          results.push({
            name: brand.name,
            redeemUrl: brand.redeemUrl,
            matchedStore: store,
          });
        }
      }
    }

    return results;
  }

  normalize(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
