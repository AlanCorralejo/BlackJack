import { Pie, PieChart } from "recharts";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent } from "../ui/chart";
import { Session } from "@/lib/types";
import { FilterDate } from "@/lib/models/stats-graph-models";
import { MdOutlineCasino } from "react-icons/md";
import { RiPokerClubsFill } from "react-icons/ri";

interface GraficaGananciaPorCasinoProps {
    sesiones: Session[],
    filtros: FilterDate,
}

interface ChartDataGananciaPorCasino {
    casino: string,
    totalWin: number,
    fill: string
}

const GraficaGananciaPorCasino = ({ sesiones, filtros }: GraficaGananciaPorCasinoProps) => {

    const getColor = (index: number) => {
        const hue = (index * 137.508) % 360
        return `hsl(${hue}, 65%, 55%)`
    }
    const data = sesiones.reduce((acc, curr, index) => {

        if (!acc[curr.casinoName]) {
            acc[curr.casinoName] = { casino: curr.casinoName, totalWin: 0, fill: getColor(index) }
        }

        acc[curr.casinoName]["totalWin"] = Math.max(0, (acc[curr.casinoName]["totalWin"] || 0) + curr.totalWin)

        return acc
    }, {} as any)

    const chartData: ChartDataGananciaPorCasino[] = Object.values(data)

    const casinos = [...new Set(sesiones.map(x => x.casinoName))]

    const chartConfig = Object.fromEntries(
        casinos.map((casino) => [
            casino,
            { label: casino, color: '#FF0000' }
        ])
    ) satisfies ChartConfig


    return (
        <div className="w-full flex flex-col space-y-4 border p-4 rounded-[10px]">
            <div className="flex items-center space-x-2">
                <div className="bg-[#41B29B26] p-2 rounded-[3px]">
                    <RiPokerClubsFill fill="#41B29B" />
                </div>
                <p className="text-sm">Balance por Casino</p>
            </div>
            <div className="grid grid-cols-2 items-center">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square h-[150px]"
                >
                    <PieChart>
                        <Pie data={chartData} dataKey="totalWin" />
                    </PieChart>
                </ChartContainer>
                <div className="flex flex-col justify-center items-center flex-wrap space-y-2">
                    {chartData.map((k, i) => (
                        <div className="rounded-[10px] bg-secondary p-3 w-full" key={i}>
                            <div className="flex items-center space-x-2">
                                <span style={{ backgroundColor: k.fill }} className="flex w-2 h-2 rounded-[2px]"></span>
                                <p className="text-sm text-gray-300">{k.casino}</p>
                            </div>
                            <p className="font-bold">${k.totalWin.toLocaleString("es-MX")}</p>
                        </div>

                    ))}
                </div>
            </div>

        </div>
    )
}

export default GraficaGananciaPorCasino;