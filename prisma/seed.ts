import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { zonedDateTimeToUtc } from "../src/lib/timezone";

const prisma = new PrismaClient();

const matches = [
  { group: "Grupo A", date: "2026-06-11", time: "16:00", home: "México", away: "África do Sul" },
  { group: "Grupo A", date: "2026-06-11", time: "19:00", home: "Guadalajara Coreia do Sul", away: "Rep. Checa" },
  { group: "Grupo A", date: "2026-06-18", time: "13:00", home: "Rep. Checa", away: "África do Sul" },
  { group: "Grupo A", date: "2026-06-18", time: "22:00", home: "México", away: "Coreia do Sul" },
  { group: "Grupo A", date: "2026-06-24", time: "22:00", home: "Rep. Checa", away: "México" },
  { group: "Grupo A", date: "2026-06-24", time: "22:00", home: "África do Sul", away: "Coreia do Sul" },
  { group: "Grupo B", date: "2026-06-12", time: "16:00", home: "Canadá", away: "Bósnia" },
  { group: "Grupo B", date: "2026-06-13", time: "16:00", home: "Catar", away: "Suíça" },
  { group: "Grupo B", date: "2026-06-18", time: "16:00", home: "Suíça", away: "Bósnia" },
  { group: "Grupo B", date: "2026-06-18", time: "19:00", home: "Canadá", away: "Catar" },
  { group: "Grupo B", date: "2026-06-24", time: "16:00", home: "Suíça", away: "Canadá" },
  { group: "Grupo B", date: "2026-06-24", time: "16:00", home: "Bósnia", away: "Catar" },
  { group: "Grupo C", date: "2026-06-13", time: "19:00", home: "Brasil", away: "Marrocos" },
  { group: "Grupo C", date: "2026-06-13", time: "22:00", home: "Haiti", away: "Escócia" },
  { group: "Grupo C", date: "2026-06-19", time: "19:00", home: "Escócia", away: "Marrocos" },
  { group: "Grupo C", date: "2026-06-19", time: "22:00", home: "Brasil", away: "Haiti" },
  { group: "Grupo C", date: "2026-06-24", time: "19:00", home: "Escócia", away: "Brasil" },
  { group: "Grupo C", date: "2026-06-24", time: "19:00", home: "Marrocos", away: "Haiti" },
  { group: "Grupo D", date: "2026-06-12", time: "22:00", home: "EUA", away: "Paraguai" },
  { group: "Grupo D", date: "2026-06-14", time: "19:00", home: "Austrália", away: "Turquia" },
  { group: "Grupo D", date: "2026-06-19", time: "16:00", home: "EUA", away: "Austrália" },
  { group: "Grupo D", date: "2026-06-20", time: "19:00", home: "Turquia", away: "Paraguai" },
  { group: "Grupo D", date: "2026-06-25", time: "23:00", home: "Turquia", away: "EUA" },
  { group: "Grupo D", date: "2026-06-25", time: "23:00", home: "Paraguai", away: "Austrália" },
  { group: "Grupo E", date: "2026-06-14", time: "14:00", home: "Alemanha", away: "Curaçau" },
  { group: "Grupo E", date: "2026-06-14", time: "20:00", home: "Equador", away: "Costa do Marfim" },
  { group: "Grupo E", date: "2026-06-20", time: "17:00", home: "Alemanha", away: "Costa do Marfim" },
  { group: "Grupo E", date: "2026-06-20", time: "21:00", home: "Equador", away: "Curaçau" },
  { group: "Grupo E", date: "2026-06-25", time: "17:00", home: "Equador", away: "Alemanha" },
  { group: "Grupo E", date: "2026-06-25", time: "17:00", home: "Curaçau", away: "Costa do Marfim" },
  { group: "Grupo F", date: "2026-06-14", time: "17:00", home: "Holanda", away: "Japão" },
  { group: "Grupo F", date: "2026-06-20", time: "20:00", home: "Suécia", away: "Tunísia" },
  { group: "Grupo F", date: "2026-06-20", time: "14:00", home: "Holanda", away: "Suécia" },
  { group: "Grupo F", date: "2026-06-20", time: "18:00", home: "Tunísia", away: "Japão" },
  { group: "Grupo F", date: "2026-06-25", time: "20:00", home: "Tunísia", away: "Holanda" },
  { group: "Grupo F", date: "2026-06-25", time: "20:00", home: "Japão", away: "Suécia" },
  { group: "Grupo G", date: "2026-06-15", time: "16:00", home: "Bélgica", away: "Egito" },
  { group: "Grupo G", date: "2026-06-15", time: "22:00", home: "Irã", away: "Nova Zelândia" },
  { group: "Grupo G", date: "2026-06-21", time: "16:00", home: "Bélgica", away: "Irã" },
  { group: "Grupo G", date: "2026-06-21", time: "22:00", home: "Nova Zelândia", away: "Egito" },
  { group: "Grupo G", date: "2026-06-27", time: "06:00", home: "Nova Zelândia", away: "Bélgica" },
  { group: "Grupo G", date: "2026-06-27", time: "06:00", home: "Egito", away: "Irã" },
  { group: "Grupo H", date: "2026-06-15", time: "13:00", home: "Espanha", away: "Cabo Verde" },
  { group: "Grupo H", date: "2026-06-15", time: "19:00", home: "Arábia Saudita", away: "Uruguai" },
  { group: "Grupo H", date: "2026-06-21", time: "13:00", home: "Espanha", away: "Arábia Saudita" },
  { group: "Grupo H", date: "2026-06-21", time: "19:00", home: "Uruguai", away: "Cabo Verde" },
  { group: "Grupo H", date: "2026-06-26", time: "21:00", home: "Uruguai", away: "Espanha" },
  { group: "Grupo H", date: "2026-06-26", time: "21:00", home: "Cabo Verde", away: "Arábia Saudita" },
  { group: "Grupo I", date: "2026-06-16", time: "16:00", home: "França", away: "Senegal" },
  { group: "Grupo I", date: "2026-06-16", time: "19:00", home: "Iraque", away: "Noruega" },
  { group: "Grupo I", date: "2026-06-22", time: "18:00", home: "França", away: "Iraque" },
  { group: "Grupo I", date: "2026-06-22", time: "21:00", home: "Noruega", away: "Senegal" },
  { group: "Grupo I", date: "2026-06-26", time: "16:00", home: "Noruega", away: "França" },
  { group: "Grupo I", date: "2026-06-26", time: "16:00", home: "Senegal", away: "Iraque" },
  { group: "Grupo J", date: "2026-06-16", time: "22:00", home: "Argentina", away: "Argélia" },
  { group: "Grupo J", date: "2026-06-17", time: "19:00", home: "Áustria", away: "Jordânia" },
  { group: "Grupo J", date: "2026-06-22", time: "14:00", home: "Argentina", away: "Áustria" },
  { group: "Grupo J", date: "2026-06-27", time: "23:00", home: "Jordânia", away: "Argélia" },
  { group: "Grupo J", date: "2026-06-27", time: "23:00", home: "Jordânia", away: "Argentina" },
  { group: "Grupo J", date: "2026-06-27", time: "23:00", home: "Argélia", away: "Áustria" },
  { group: "Grupo K", date: "2026-06-17", time: "14:00", home: "Portugal", away: "RD Congo" },
  { group: "Grupo K", date: "2026-06-17", time: "23:00", home: "México", away: "Uzbequistão" },
  { group: "Grupo K", date: "2026-06-23", time: "14:00", home: "Portugal", away: "Uzbequistão" },
  { group: "Grupo K", date: "2026-06-23", time: "23:00", home: "Colômbia", away: "RD Congo" },
  { group: "Grupo K", date: "2026-06-27", time: "20:30", home: "Colômbia", away: "Portugal" },
  { group: "Grupo K", date: "2026-06-27", time: "20:30", home: "RD Congo", away: "Uzbequistão" },
  { group: "Grupo L", date: "2026-06-17", time: "17:00", home: "Inglaterra", away: "Croácia" },
  { group: "Grupo L", date: "2026-06-17", time: "20:00", home: "Gana", away: "Panamá" },
  { group: "Grupo L", date: "2026-06-23", time: "17:00", home: "Inglaterra", away: "Gana" },
  { group: "Grupo L", date: "2026-06-27", time: "18:00", home: "Panamá", away: "Inglaterra" },
  { group: "Grupo L", date: "2026-06-27", time: "18:00", home: "Croácia", away: "Gana" }
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@inca.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const adminName = process.env.ADMIN_NAME ?? "Administrador";

  for (const match of matches) {
    await prisma.match.upsert({
      where: {
        id: `${match.group}-${match.date}-${match.time}-${match.home}-${match.away}`
      },
      update: {
        groupName: match.group,
        matchDate: match.date,
        matchTime: match.time,
        kickoffAt: zonedDateTimeToUtc(match.date, match.time),
        homeTeam: match.home,
        awayTeam: match.away,
        isActive: true
      },
      create: {
        id: `${match.group}-${match.date}-${match.time}-${match.home}-${match.away}`,
        groupName: match.group,
        matchDate: match.date,
        matchTime: match.time,
        kickoffAt: zonedDateTimeToUtc(match.date, match.time),
        homeTeam: match.home,
        awayTeam: match.away,
        isActive: true
      }
    });
  }

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "admin"
    },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "admin"
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
