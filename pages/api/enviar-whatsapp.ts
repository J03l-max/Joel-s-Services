// pages/api/enviar-whatsapp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const {
      datosSolicitante,
      cantidadInvitados,
      horario,
      servicio,
      tipoEvento,
      cantidadMozos,
      distrito,
      observaciones,
      fechas,
    } = req.body;

    // Asegúrate de que MY_PHONE_NUMBER está en formato +51...
    const raw = process.env.MY_PHONE_NUMBER!;
    const to = raw.startsWith('whatsapp:') ? raw : `whatsapp:${raw}`;

    const mensaje = `🔔 *Nueva reserva desde Joel's Services* 🔔

👤 Nombre: ${datosSolicitante}
📍 Distrito: ${distrito}
📅 Fecha(s): ${Array.isArray(fechas) ? fechas.join(', ') : fechas}
⏰ Horario: ${horario}
👥 Invitados: ${cantidadInvitados}
🧑‍🍳 Mozos: ${cantidadMozos}
🎉 Tipo de evento: ${tipoEvento}
🧰 Servicio solicitado: ${servicio}
📝 Observaciones: ${observaciones || 'Ninguna'}`;

    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER!,
      to,
      body: mensaje,
    });

    return res.status(200).json({ success: true, sid: message.sid });
  } catch (error: any) {
    console.error('Error al enviar mensaje:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
