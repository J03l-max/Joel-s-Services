// pages/index.tsx
import { useState } from "react";
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth
} from "date-fns";

export default function AppReservas() {
  // Feriados en Perú (2025)
  const diasFestivos = [
    "2025-01-01", // Año Nuevo
    "2025-04-02", // Jueves Santo
    "2025-04-03", // Viernes Santo
    "2025-05-01", // Día del Trabajo
    "2025-06-29", // San Pedro y San Pablo
    "2025-07-28", // Independencia
    "2025-07-29", // Día de la Independencia
    // …añade los que necesites
  ];
  // Días ya reservados (no seleccionables)
  const diasReservados = ["2025-04-16", "2025-04-18"];

  const [mesActual, setMesActual] = useState(new Date());
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState<string[]>([]);
  const [datosSolicitante, setDatosSolicitante] = useState("");
  const [cantidadInvitados, setCantidadInvitados] = useState<number | "">("");
  const [horario, setHorario] = useState("");
  const [tipoEvento, setTipoEvento] = useState("");
  const [otroEvento, setOtroEvento] = useState("");
  const [tipoServicio, setTipoServicio] = useState("");
  const [numeroServicio, setNumeroServicio] = useState<number | "">("");
  const [distrito, setDistrito] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // Construcción del mes en calendario
  const start = startOfWeek(startOfMonth(mesActual), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(mesActual), { weekStartsOn: 0 });
  const diasCalendario = eachDayOfInterval({ start, end });

  // Manejo de selección de fecha
  const toggleFecha = (fecha: string) => {
    if (diasReservados.includes(fecha)) return;
    if (diasFestivos.includes(fecha) && !fechasSeleccionadas.includes(fecha)) {
      alert("❗ Atención: es un día feriado y tendrá costo extra");
    }
    setFechasSeleccionadas(prev =>
      prev.includes(fecha)
        ? prev.filter(f => f !== fecha)
        : [...prev, fecha]
    );
  };

  // Valida que todos los campos obligatorios estén llenos
  const isFormValid = () => {
    if (!datosSolicitante || !cantidadInvitados || !horario || !tipoEvento || !tipoServicio || !distrito) return false;
    if (tipoEvento === "Otro" && !otroEvento) return false;
    if ((tipoServicio === "Mozo" || tipoServicio === "Seguridad") && !numeroServicio) return false;
    if (fechasSeleccionadas.length === 0) return false;
    return true;
  };

  // Envío de reserva
  const enviarReserva = async () => {
    const evento = tipoEvento === "Otro" ? otroEvento : tipoEvento;
    const servicio = tipoServicio;
    const data = {
      datosSolicitante,
      cantidadInvitados,
      horario,
      tipoEvento: evento,
      tipoServicio: servicio,
      numeroServicio,
      distrito,
      observaciones,
      fechas: fechasSeleccionadas,
    };
    try {
      const res = await fetch("/api/enviar-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        alert("✅ Reserva enviada con éxito!");
      } else {
        alert("❌ Error al enviar la reserva.");
      }
    } catch {
      alert("❌ Error de conexión.");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Joel&apos;s Services</h1>

      {/* Calendario */}
      <div className="flex justify-between items-center mb-2">
        <button onClick={() => setMesActual(addMonths(mesActual, -1))}>◀️</button>
        <h2 className="text-xl font-semibold">{format(mesActual, "MMMM yyyy")}</h2>
        <button onClick={() => setMesActual(addMonths(mesActual, 1))}>▶️</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm mb-6">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(d => (
          <div key={d} className="text-center font-medium">{d}</div>
        ))}
        {diasCalendario.map((dia, i) => {
          const fecha = format(dia, "yyyy-MM-dd");
          const esMes = isSameMonth(dia, mesActual);
          const esReservada = diasReservados.includes(fecha);
          const esFestivo = diasFestivos.includes(fecha);
          const esSeleccionada = fechasSeleccionadas.includes(fecha);
          let bg = "bg-gray-100 text-gray-400";
          if (!esMes) bg = "bg-gray-100 text-gray-400";
          else if (esReservada) bg = "bg-red-500 text-white";
          else if (esSeleccionada && esFestivo) bg = "bg-yellow-600 text-white";
          else if (esSeleccionada) bg = "bg-green-500 text-white";
          else if (esFestivo) bg = "bg-red-300 text-white";
          else bg = "bg-blue-100";

          return (
            <button
              key={i}
              onClick={() => toggleFecha(fecha)}
              disabled={esReservada || !esMes}
              className={`p-2 rounded ${bg}`}
            >
              {format(dia, "d")}
            </button>
          );
        })}
      </div>

      {/* Formulario */}
      <div className="space-y-4">
        <input
          type="text" placeholder="Nombre solicitante"
          value={datosSolicitante}
          onChange={e => setDatosSolicitante(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <div>
          <select
            value={tipoEvento}
            onChange={e => setTipoEvento(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Tipo de evento</option>
            <option value="Boda">Boda</option>
            <option value="Cumpleaños">Cumpleaños</option>
            <option value="Fiesta de promoción">Fiesta de promoción</option>
            <option value="15 años">15 años</option>
            <option value="Otro">Otro</option>
          </select>
          {tipoEvento === "Otro" && (
            <input
              type="text" placeholder="Especifica el evento"
              value={otroEvento}
              onChange={e => setOtroEvento(e.target.value)}
              className="w-full p-2 border rounded mt-2"
            />
          )}
        </div>

        <input
          type="number" placeholder="Cantidad de invitados"
          value={cantidadInvitados}
          onChange={e => setCantidadInvitados(+e.target.value)}
          className="w-full p-2 border rounded"
        />

        <input
          type="time" placeholder="Horario"
          value={horario}
          onChange={e => setHorario(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <div>
          <select
            value={tipoServicio}
            onChange={e => setTipoServicio(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Tipo de servicio</option>
            <option value="Mozo">Mozo</option>
            <option value="Seguridad">Seguridad</option>
            <option value="Coordinador">Coordinador</option>
            <option value="Otro">Otro</option>
          </select>
          {(tipoServicio === "Mozo" || tipoServicio === "Seguridad") && (
            <input
              type="number"
              placeholder={`Cantidad de ${tipoServicio.toLowerCase()}s`}
              value={numeroServicio}
              onChange={e => setNumeroServicio(+e.target.value)}
              className="w-full p-2 border rounded mt-2"
            />
          )}
        </div>

        <select
          value={distrito}
          onChange={e => setDistrito(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Distrito</option>
          {[
            "Lurín", "José Gálvez", "Villa El Salvador", "Villa María del Triunfo",
            "San Juan de Miraflores", "Chorrillos", "San Isidro", "Miraflores",
            "Surco", "Surquillo"
          ].map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <textarea
          placeholder="Observaciones (opcional)"
          value={observaciones}
          onChange={e => setObservaciones(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <button
          onClick={enviarReserva}
          disabled={!isFormValid()}
          className="w-full bg-green-600 text-white p-2 rounded disabled:opacity-50"
        >
          Enviar reserva
        </button>
      </div>
    </div>
  );
}




