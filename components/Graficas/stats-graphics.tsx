import { Session } from "@/lib/types";
import { ComboBox } from "../ui/Combobox";
import { useState } from "react";
import { FilterDate } from "@/lib/models/stats-graph-models";
import GraficaBarrasGeneral from "./GraficaBarrasGeneral";
import GraficaBalanceAcumuladoDiario from "./GraficaBalanceAcumuladoDiario";
import GraficaBankRollAcumulado from "./GraficaBankRollAcumulado";
import GraficaGananciaPorCasino from "./GraficaGananciaPorCasino";

interface SessionGraphicProps {
    sesiones: Session[]
}

const StatsGraphics = ({ sesiones }: SessionGraphicProps) => {
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const [filtros, setFiltros] = useState<FilterDate>({ month: currentMonth, year: currentYear, casino: '' })
    const months = [
        { label: "Enero", value: 1, isEnable: true },
        { label: "Febrero", value: 2, isEnable: true },
        { label: "Marzo", value: 3, isEnable: true },
        { label: "Abril", value: 4, isEnable: true },
        { label: "Mayo", value: 5, isEnable: true },
        { label: "Junio", value: 6, isEnable: true },
        { label: "Julio", value: 7, isEnable: true },
        { label: "Agosto", value: 8, isEnable: true },
        { label: "Septiembre", value: 9, isEnable: true },
        { label: "Octubre", value: 10, isEnable: true },
        { label: "Noviembre", value: 11, isEnable: true },
        { label: "Diciembre", value: 12, isEnable: true },
    ];

    const casinos = [...new Set(sesiones.map(s => s.casinoName))]
        .map((nombre) => ({ label: nombre, value: nombre, isEnable: true }));

    casinos.push({ label: 'Todos', value: '', isEnable: true })

    const years = Array.from({ length: 10 }, (_, i) => ({
        label: (currentYear + i).toString(),
        value: currentYear + i,
        isEnable: true
    }));
    return (
        <div className="mx-auto space-y-6 px-4">
            <div className="flex w-full px-4 mx-auto space-x-2 border p-2 rounded-[10px]">
                <ComboBox
                    data={casinos}
                    onSelect={(value) => setFiltros(prev => ({ ...prev, casino: value }))}
                    currentSelected={filtros.casino}
                    placeholderMessage="Casino"
                    selectMessage="Casino"
                    className="max-w-max"
                    sort={false}
                />
                <ComboBox
                    data={years}
                    onSelect={(value) => setFiltros(prev => ({ ...prev, year: value }))}
                    currentSelected={filtros.year}
                    placeholderMessage="Selecciona el año"
                    selectMessage="Selecciona el año"
                    className="max-w-max"
                />
                <ComboBox
                    data={months}
                    onSelect={(value) => setFiltros(prev => ({ ...prev, month: value }))}
                    currentSelected={filtros.month}
                    placeholderMessage="Selecciona el año"
                    selectMessage="Selecciona el año"
                    className="max-w-max"
                    sort={false}
                />
            </div>
            <div className="flex flex-col space-y-4 pb-25">
                <GraficaBankRollAcumulado filtros={filtros} sesiones={sesiones} />
                <GraficaBalanceAcumuladoDiario filtros={filtros} sesiones={sesiones} />
                <GraficaGananciaPorCasino filtros={filtros} sesiones={sesiones} />
                <GraficaBarrasGeneral filtros={filtros} sesiones={sesiones} />
            </div>
        </div>
    )
}

export default StatsGraphics;