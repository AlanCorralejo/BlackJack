import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { Session } from "@/lib/types"
import { FilterDate } from "@/lib/models/stats-graph-models"
import { VscGraph } from "react-icons/vsc";
import { GiPokerHand } from "react-icons/gi";

interface GraficaBarrasGeneralProps {
    sesiones: Session[],
    filtros: FilterDate,
}

const GraficaBarrasGeneral = ({ sesiones, filtros }: GraficaBarrasGeneralProps) => {

    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto",
        "Septiempre", "Octubre", "Noviembre", "Diciembre"]

    const data = sesiones.filter(x => Number(x.date.split('-')[0]) == filtros.year).reduce((acc, curr) => {
        const mesIndex = Number(curr.date.split('-')[1]) - 1
        const mesNombre = meses[mesIndex]

        if (!acc[mesNombre]) {
            acc[mesNombre] = { mes: mesNombre }
        }

        acc[mesNombre][curr.casinoName] = (acc[mesNombre][curr.casinoName] || 0) + curr.totalWin

        return acc
    }, {} as any)

    const chartData = Object.values(data)

    const casinos = [...new Set(sesiones.map(x => x.casinoName))]

    const getColor = (index: number) => {
        const hue = (index * 137.508) % 360
        return `hsl(${hue}, 65%, 55%)`
    }
    const chartConfig = Object.fromEntries(
        casinos.map((casino, index) => [
            casino,
            {
                label: casino,
                color: getColor(index)
            }
        ])
    ) as ChartConfig
    return (
        <div className="w-full flex flex-col space-y-4 border p-4 rounded-[10px]">
            <div className="flex items-center space-x-2">
                <div className="bg-[#8B78DC40] p-2 rounded-[3px]">
                    <GiPokerHand fill="#8B78DC" />
                </div>
                <p className="text-sm">Ganancias por mes</p>
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
                    <CartesianGrid vertical horizontal />
                    <XAxis
                        dataKey="mes"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis
                        tickLine={false}
                        tickMargin={2}
                        axisLine={false}
                        tickFormatter={(value) => `$${value.toLocaleString("es-MX")}`}

                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    {casinos.map((k, i) => (
                        <Bar
                            dataKey={k}
                            type="monotone"
                            strokeWidth={2}
                            fill={chartConfig[k].color}
                            radius={4}
                        />
                    ))
                    }
                    <ChartLegend content={<ChartLegendContent />} />

                </BarChart>
            </ChartContainer>
        </div >
    )
}

export default GraficaBarrasGeneral;