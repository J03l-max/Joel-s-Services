// pages/api/enviar-whatsapp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
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

      const mensaje = `
🔔 *Nueva reserva desde Joel's Services* 🔔

👤 Nombre: ${datosSolicitante}
📍 Distrito: ${distrito}
📅 Fecha(s): ${fechas}
⏰ Horario: ${horario}
👥 Invitados: ${cantidadInvitados}
🧑‍🍳 Mozos: ${cantidadMozos}
🎉 Tipo de evento: ${tipoEvento}
🧰 Servicio solicitado: ${servicio}
📝 Observaciones: ${observaciones || 'Ninguna'}
`;

      const message = await client.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: process.env.MY_PHONE_NUMBER!,
        body: mensaje,
      });

      res.status(200).json({ success: true, sid: message.sid });
    } catch (error: any) {
      console.error('Error al enviar mensaje:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
