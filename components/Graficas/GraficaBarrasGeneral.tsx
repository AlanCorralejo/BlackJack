import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { Session } from "@/lib/types"
import { FilterDate } from "@/lib/models/stats-graph-models"
import { VscGraph } from "react-icons/vsc";

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

    const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`
    const chartConfig = Object.fromEntries(
        casinos.map((casino) => [
            casino,
            {
                label: casino,
                color: getRandomColor()
            }
        ])
    ) as ChartConfig
    return (
        <div className="w-full flex flex-col space-y-4 border p-4 rounded-[10px]">
            <div className="flex items-center space-x-2">
                <VscGraph fill="#32CD32" />
                <p>Ganancias por mes</p>
            </div>
            <ChartContainer className="mx-auto aspect-square max-h-62.5 w-full " config={chartConfig}>
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
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    {casinos.map((k, i) => (
                        <Bar
                            dataKey={k}
                            type="monotone"
                            strokeWidth={2}
                            fill={chartConfig[k].color}
                        />
                    ))

                    }
                </BarChart>
            </ChartContainer>
        </div >
    )
}

export default GraficaBarrasGeneral;