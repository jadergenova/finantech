import { prisma } from "@/lib/prisma";
import { CartoesClient } from "./client";

export default async function CartoesPage() {
  const cartoes = await prisma.cartao.findMany({ where: { isActive: true }, orderBy: { nome: "asc" } });
  return <CartoesClient initialCartoes={cartoes} />;
}
