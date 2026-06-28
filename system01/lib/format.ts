const FUSO_HORARIO = "America/Sao_Paulo";

export function formatarData(data: Date | string | null | undefined) {
  if (!data) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeZone: FUSO_HORARIO,
  }).format(new Date(data));
}

export function formatarDataHora(data: Date | string | null | undefined) {
  if (!data) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: FUSO_HORARIO,
  }).format(new Date(data));
}

export function formatarDataParaInput(data: Date | string | null | undefined) {
  if (!data) return "";

  const partes = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: FUSO_HORARIO,
  }).formatToParts(new Date(data));

  const valores = Object.fromEntries(partes.map((parte) => [parte.type, parte.value]));
  return `${valores.year}-${valores.month}-${valores.day}`;
}

export function formatarDataHoraParaInput(data: Date | string | null | undefined) {
  if (!data) return "";

  const partes = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: FUSO_HORARIO,
  }).formatToParts(new Date(data));

  const valores = Object.fromEntries(partes.map((parte) => [parte.type, parte.value]));
  return `${valores.year}-${valores.month}-${valores.day}T${valores.hour}:${valores.minute}`;
}

export function formatarTamanho(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatarStatus(valor: string) {
  return valor.replaceAll("_", " ").replace(/\b\w/g, (letra) => letra.toUpperCase());
}

function inicioDoDiaNoFuso(data: Date) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: FUSO_HORARIO,
  }).formatToParts(data);
  const valores = Object.fromEntries(partes.map((parte) => [parte.type, parte.value]));
  return Date.UTC(Number(valores.year), Number(valores.month) - 1, Number(valores.day));
}

export function classificarPrazo(data: Date | string) {
  const alvo = inicioDoDiaNoFuso(new Date(data));
  const hoje = inicioDoDiaNoFuso(new Date());
  const diferenca = Math.round((alvo - hoje) / 86_400_000);

  if (diferenca < 0) return { codigo: "vencido", texto: "Vencido" };
  if (diferenca === 0) return { codigo: "hoje", texto: "Hoje" };
  if (diferenca === 1) return { codigo: "amanha", texto: "Amanhã" };
  if (diferenca <= 7) return { codigo: "proximo", texto: `Em ${diferenca} dias` };
  return { codigo: "futuro", texto: `Em ${diferenca} dias` };
}

export function parseDataDoFormulario(valor: string) {
  if (!valor) return null;
  const data = new Date(`${valor}T12:00:00-03:00`);
  return Number.isNaN(data.getTime()) ? null : data;
}

export function parseDataHoraDoFormulario(valor: string) {
  if (!valor) return null;
  const data = new Date(`${valor}:00-03:00`);
  return Number.isNaN(data.getTime()) ? null : data;
}
