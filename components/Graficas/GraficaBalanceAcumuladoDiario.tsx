import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Session } from "@/lib/types";
import { FilterDate } from "@/lib/models/stats-graph-models";
import { GiCardJoker } from "react-icons/gi";
import { RiPokerSpadesFill } from "react-icons/ri";

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
    const chartData = sesiones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).filter(x => Number(x.date.split('-')[0]) == filtros.year)
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
        ganancia: {
            label: "Ganancia",
            color: "#32CD32",
        },
    } satisfies ChartConfig

    return (
        <div className="w-full flex flex-col space-y-4 border p-4 rounded-[10px]">
            <div className="flex items-center space-x-2">
                <div className="bg-[#E0525240] p-2 rounded-[3px]">
                    <RiPokerSpadesFill fill="#E05252" />
                </div>
                <p className="text-sm">Balance por sesión - {filtros.casino || "Todos"}</p>
            </div>
            <ChartContainer config={chartConfig}>
                <BarChart
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
                        tickFormatter={(value) => `${value.split('-')[2]}-${meses[Number(value.split('-')[1]) - 1].slice(0, 3)}`}
                    />
                    <YAxis
                        dataKey="totalWin"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => `$${value.toLocaleString("es-MX")}`}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="totalWin" radius={4}>
                        {chartData.map((item, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={item.totalWin >= 0 ? "#41B29B" : "#E05252"}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ChartContainer>
        </div>
    )
}

export default GraficaBalanceAcumuladoDiario;