import { BsGraphUpArrow } from "react-icons/bs"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { FilterDate } from "@/lib/models/stats-graph-models"
import { Session } from "@/lib/types"

interface GraficaBankRollAcumuladoProps {
    sesiones: Session[],
    filtros: FilterDate,
}

interface ChartConfigBankRoll {
    date: string,
    totalWin: number,
}

const GraficaBankRollAcumulado = ({ sesiones, filtros }: GraficaBankRollAcumuladoProps) => {

    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto",
        "Septiempre", "Octubre", "Noviembre", "Diciembre"]

    const chartData = sesiones.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).filter(x => Number(x.date.split('-')[0]) === filtros.year)
        .reduce((acc, curr, index) => {
            
            const lastValue = acc[index -1]?.totalWin ? acc[index -1]?.totalWin : 0
            
            acc.push({date: curr.date, totalWin: lastValue + curr.totalWin})
            return acc

        }, [] as ChartConfigBankRoll[])
        
    const chartConfig = {
        totalWin: {
            label: "Ganancia",
            color: "text-primary",
        },
    } satisfies ChartConfig
    
    return (
        <div className="w-full flex flex-col space-y-4 border p-4 rounded-[10px]">
            <div className="flex items-center space-x-2">
                <BsGraphUpArrow className="text-primary" />
                <p>BankRoll Acumulado</p>
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
                        stroke="var(--primary)"
                    />
                </LineChart>
            </ChartContainer>
        </div>
    )
}

export default GraficaBankRollAcumulado