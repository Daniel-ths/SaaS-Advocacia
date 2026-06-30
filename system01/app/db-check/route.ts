import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";

export async function GET() {
  try {
    const result = await sql`
      SELECT NOW() AS conectado_em,
             current_database() AS banco
    `;

    return NextResponse.json({
      ok: true,
      mensagem: "Neon conectado com sucesso.",
      dados: result[0],
    });
  } catch (error) {
    console.error("Erro ao conectar ao Neon:", error);

    return NextResponse.json(
      {
        ok: false,
        mensagem: "Não foi possível conectar ao banco.",
      },
      { status: 500 }
    );
  }
}