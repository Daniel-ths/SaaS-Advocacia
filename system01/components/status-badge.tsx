type StatusKind = "cliente" | "processo" | "agenda";

type StatusBadgeProps = {
  status: string;
  kind: StatusKind;
};

const labels: Record<string, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  prospecto: "Prospecto",
  aberto: "Aberto",
  em_andamento: "Em andamento",
  aguardando: "Aguardando",
  encerrado: "Encerrado",
  pendente: "Pendente",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

const clientClasses: Record<string, string> = {
  ativo: "border-[#c9dac9] bg-[#edf5ed] text-[#31503a]",
  prospecto: "border-[#e6d6ae] bg-[#faf5e8] text-[#795e2d]",
  inativo: "border-[#ddd9d1] bg-[#f3f1ed] text-[#67635d]",
};

const processClasses: Record<string, string> = {
  aberto: "border-[#d8d4cb] bg-[#f5f2ec] text-[#4c4942]",
  em_andamento: "border-[#d6d4c4] bg-[#f4f3e9] text-[#5e5a31]",
  aguardando: "border-[#ead4b5] bg-[#fcf4e8] text-[#89582a]",
  encerrado: "border-[#ccd8cc] bg-[#edf3ed] text-[#3f5c43]",
};

const agendaClasses: Record<string, string> = {
  pendente: "border-[#e6d6ae] bg-[#faf5e8] text-[#795e2d]",
  concluido: "border-[#ccd8cc] bg-[#edf3ed] text-[#3f5c43]",
  cancelado: "border-[#ddd9d1] bg-[#f3f1ed] text-[#67635d]",
};

export default function StatusBadge({ status, kind }: StatusBadgeProps) {
  const classes = kind === "cliente" ? clientClasses : kind === "processo" ? processClasses : agendaClasses;

  return (
    <span className={`status-badge ${classes[status] ?? "border-[#ddd9d1] bg-[#f3f1ed] text-[#67635d]"}`}>
      {labels[status] ?? status}
    </span>
  );
}
