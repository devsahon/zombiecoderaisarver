import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { DynamicModels } from "@/components/dynamic-models"



export default function ModelsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">AI Models</h1>
            <p className="text-slate-600">Manage and monitor your local AI models</p>
          </div>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Model Settings
          </Button>
        </div>

        {/* Models Grid */}
        <DynamicModels />
      </div>
    </div>
  )
}
