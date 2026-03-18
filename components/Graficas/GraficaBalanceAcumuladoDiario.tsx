import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Session } from "@/lib/types";
import { FilterDate } from "@/lib/models/stats-graph-models";
import { BsGraphUpArrow } from "react-icons/bs";

interface GraficaBalanceAcumuladoDiarioProps {
    sesiones: Session[],
    filtros: FilterDate,
}

interface ChartConfigLinea {
    date: string,
    totalWin: number,
    casino: string
}

const GraficaBalanceAcumuladoDiario = ({ sesiones, filtros }: GraficaBalanceAcumuladoDiarioProps) => {

    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto",
        "Septiempre", "Octubre", "Noviembre", "Diciembre"]
    const chartData = sesiones.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).filter(x => Number(x.date.split('-')[0]) == filtros.year)
        .filter(x => Number(x.date.split('-')[1]) == filtros.month)
        .filter(x => filtros.casino === '' || x.casinoName === filtros.casino)
        .reduce((acc, curr) => {
            const existing = acc.find(
                item => item.date === curr.date && item.casino === curr.casinoName
            );

            if (existing) {
                existing.totalWin += curr.totalWin;
            } else {
                acc.push({ date: curr.date, casino: curr.casinoName, totalWin: curr.totalWin });
            }

            return acc;
        }, [] as ChartConfigLinea[]);


    const chartConfig = {
        totalWin: {
            label: "Ganancia",
            color: "#32CD32",
        },
    } satisfies ChartConfig


    return (
        <div className="w-full flex flex-col space-y-4 border p-4 rounded-[10px]">
            <div className="flex items-center space-x-2">
                <BsGraphUpArrow fill="#32CD32" />
                <p>Balance por sesión - {filtros.casino || "Todos"}</p>
            </div>
            <ChartContainer config={chartConfig}>
                <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                        left: 12,
                        right: 12,
                    }}
                >
                    <CartesianGrid />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => `${value.split('-')[2]}-${meses[Number(value.split('-')[1]) - 1].slice(0,3)}`}
                    />
                    <YAxis
                        dataKey="totalWin"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Line
                        dataKey="totalWin"
                        type="natural"
                        strokeWidth={2}
                        dot={false}
                        stroke="#32CD32"
                    />
                </LineChart>
            </ChartContainer>
        </div>
    )
}

export default GraficaBalanceAcumuladoDiario;