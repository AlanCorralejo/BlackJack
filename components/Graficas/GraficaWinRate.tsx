import { VscGraph } from "react-icons/vsc";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Session } from "@/lib/types";
import { FilterDate } from "@/lib/models/stats-graph-models";

interface GraficaBarrasWinRateProps {
    sesiones: Session[],
    filtros: FilterDate,
}

interface ChartConfigWinRate {
    casino: string,
    victorias: number,
    derrotas: number
}

const GraficaWinRate = ({ sesiones, filtros }: GraficaBarrasWinRateProps) => {

    const test = sesiones.filter(x => Number(x.date.split('-')[0]) === filtros.year)
        .filter(x => Number(x.date.split('-')[1]) === filtros.month).reduce((acc, curr, index) => {

            const existe = acc.find(x => x.casino === curr.casinoName)
            if (!existe) {
                acc.push({ casino: curr.casinoName, victorias: 0, derrotas: 0 })
            }
            

            return acc
        }, [] as ChartConfigWinRate[])

    const chartData = [
        { casino: "January", victorias: 2, derrotas: 3 },
        { casino: "February", victorias: 7, derrotas: 10 },
        { casino: "March", victorias: 3, derrotas: 5 },
        { casino: "April", victorias: 7, derrotas: 1 },
        { casino: "May", victorias: 2, derrotas: 4 },
        { casino: "June", victorias: 1, derrotas: 9 },
    ]

    const chartConfig = {
        victorias: {
            label: "Victorias",
            color: "var(--chart-1)",
        },
        derrotas: {
            label: "Derrotas",
            color: "var(--chart-2)",
        },
    } satisfies ChartConfig

    return (
        <div className="w-full flex flex-col space-y-4 border p-4 rounded-[10px]">
            <div className="flex items-center space-x-2">
                <VscGraph fill="#32CD32" />
                <p>Winrate por Casino</p>
            </div>
            <ChartContainer config={chartConfig}>
                <BarChart
                    accessibilityLayer
                    data={chartData}
                    layout="vertical"
                    margin={{
                        left: -20,
                    }}
                >
                    <XAxis
                        type="number"
                        tickLine={false}
                        tickMargin={2}
                    />
                    <YAxis
                        dataKey="casino"
                        type="category"
                        tickLine={false}
                        tickMargin={10}
                        tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar
                        dataKey="victorias"
                        fill="#32CD32"
                        radius={5}
                        stackId="a"
                    />
                    <Bar
                        stackId="a"
                        dataKey="derrotas"
                        fill="#FF0000"
                        radius={5}
                    />
                </BarChart>
            </ChartContainer>
        </div >
    )
}

export default GraficaWinRate;