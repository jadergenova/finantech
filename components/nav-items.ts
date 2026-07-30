import { LayoutGrid, PiggyBank, Building2, CreditCard, Receipt, Wallet, Landmark } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutGrid, label: "Início" },
  { href: "/renda-fixa", icon: PiggyBank, label: "Renda Fixa" },
  { href: "/fiis", icon: Building2, label: "FIIs" },
  { href: "/cartoes", icon: CreditCard, label: "Cartões" },
  { href: "/contas-fixas", icon: Receipt, label: "Contas Fixas" },
  { href: "/conta-corrente", icon: Wallet, label: "Conta Corrente" },
  { href: "/fgts", icon: Landmark, label: "FGTS" },
];
