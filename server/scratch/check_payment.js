
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.hoadon.findFirst({
    where: {
      OR: [
        { MaHoaDon: 'HDHD202604003' },
        { NoiDungCK: 'HDHD202604003' }
      ]
    },
    include: { thanhtoan: true }
  });
  console.log(JSON.stringify(result, null, 2));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
