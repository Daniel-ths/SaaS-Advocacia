import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { documentos } from "@/lib/db/schema";

function nomeSeguro(nome: string) {
  return nome.replace(/[\\/\r\n"]/g, "_");
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  const documento = await db.query.documentos.findFirst({ where: eq(documentos.id, id) });

  if (!documento) {
    return new Response("Documento não encontrado.", { status: 404 });
  }

  return new Response(new Uint8Array(Buffer.from(documento.conteudoBase64, "base64")), {
    headers: {
      "Content-Type": documento.mimeType,
      "Content-Length": String(documento.tamanhoBytes),
      "Content-Disposition": `attachment; filename="${nomeSeguro(documento.nomeArquivo)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
