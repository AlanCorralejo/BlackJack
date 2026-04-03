import { Session } from "@/lib/types";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import { Calendar } from "./ui/calendar";


interface CalendarioHistorialProps {
    sesiones: Session[]
}

const CalendarioHistorial = ({ sesiones }: CalendarioHistorialProps) => {
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const currentDate = new Date()
    const currendDateFormat = currentDate.toLocaleDateString('es-MX', {
        month: 'long',
        year: 'numeric'
    });
    const resultado = sesiones.reduce((acc, x) => {
        const [year, month] = x.date.split('-').map(Number);

        if (year === currentYear && month === currentMonth) {
            acc.sesionesJugadas++;

            if (x.totalWin > 0) acc.sesionesGanadas++;
            else if (x.totalWin < 0) acc.sesionesPerdidas++;
        }

        return acc;
    }, {
        sesionesGanadas: 0,
        sesionesPerdidas: 0,
        sesionesJugadas: 0
    });

    const { sesionesGanadas, sesionesPerdidas, sesionesJugadas } = resultado;


    const gananciaMes = sesiones.filter(x => Number(x.date.split('-')[0]) === currentYear)
        .filter(x => Number(x.date.split('-')[1]) === currentMonth)
        .reduce((acc, curr) => {

            acc += curr.totalWin

            return acc
        }, 0)

    return (
        <div className="px-4 space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-[10px] bg-secondary">
                <div>
                    <p className="text-muted-foreground capitalize">{currendDateFormat}</p>
                    <p className={`font-bold text-xl ${gananciaMes > 0 ? 'text-success' : gananciaMes < 0 ? 'text-destructive' : 'text-white'}`}>
                        {gananciaMes > 0 ? "+" : gananciaMes < 0 ? "-" : ""}${gananciaMes}
                    </p>
                </div>
                <div className={`p-3 rounded-[8px] ${gananciaMes > 0 ? "bg-green-500/40" : gananciaMes < 0 ? "bg-red-500/40" : ""}`}>
                    {
                        gananciaMes > 0 ? <FaArrowTrendUp className="text-success" size={20} /> : gananciaMes < 0 ? <FaArrowTrendDown className="text-destructive" size={20} /> : <></>
                    }
                </div>
            </div>
            <div className="flex space-x-2 w-full">
                <div className="flex flex-col items-center border p-4 rounded-[10px] w-full bg-secondary">
                    <p className="font-bold text-lg">{sesionesJugadas}</p>
                    <p className="text-xs">Días jugados</p>
                </div>
                <div className="flex flex-col items-center border p-4 rounded-[10px] w-full bg-secondary">
                    <p className="font-bold text-lg text-success">{sesionesGanadas}</p>
                    <p className="text-xs">Días ganados</p>
                </div>
                <div className="flex flex-col items-center border p-4 rounded-[10px] w-full bg-secondary">
                    <p className="font-bold text-lg  text-destructive">{sesionesPerdidas}</p>
                    <p className="text-xs">Días perdidos</p>
                </div>
            </div>

            <div className="border w-full rounded-[10px] bg-secondary">
                <Calendar
                    mode="single"
                    className="rounded-[10px] w-full"
                />
            </div>
        </div>
    )
}

export default CalendarioHistorial;