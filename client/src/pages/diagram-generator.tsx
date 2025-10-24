import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, Network, GitBranch, Workflow, Pencil, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { API_URL } from "@/lib/config";

type DiagramType = "mermaid" | "graphviz" | "bpmn" | "excalidraw";
type FormatType = "svg" | "png";

const diagramTypes = [
  { value: "mermaid" as DiagramType, label: "Mermaid", icon: Network },
  { value: "graphviz" as DiagramType, label: "Graphviz", icon: GitBranch },
  { value: "bpmn" as DiagramType, label: "BPMN", icon: Workflow },
  { value: "excalidraw" as DiagramType, label: "Excalidraw", icon: Pencil },
];

const formatTypes = [
  { value: "svg" as FormatType, label: "SVG" },
  { value: "png" as FormatType, label: "PNG" },
];

const defaultExamples: Record<DiagramType, string> = {
  mermaid: `sequenceDiagram
    participant Alice
    participant Bob
    Bob->>Alice: Hi Alice
    Alice->>Bob: Hi Bob`,
  graphviz: `digraph G {
    A -> B;
    B -> C;
    C -> A;
}`,
  bpmn: `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <process id="Process_1">
    <startEvent id="StartEvent_1"/>
  </process>
</definitions>`,
  excalidraw: `{
  "type": "rectangle",
  "x": 100,
  "y": 100,
  "width": 200,
  "height": 100
}`,
};

export default function DiagramGenerator() {
  const [diagramType, setDiagramType] = useState<DiagramType>("mermaid");
  const [format, setFormat] = useState<FormatType>("svg");
  const [code, setCode] = useState(defaultExamples.mermaid);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(true);
  const [zoom, setZoom] = useState(100);
  const { toast } = useToast();

  const handleDiagramTypeChange = (type: DiagramType) => {
    setDiagramType(type);
    setCode(defaultExamples[type]);
    setGeneratedImage(null);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 25));
  };

  const handleZoomReset = () => {
    setZoom(100);
  };

  const handleGenerate = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter diagram code",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`${API_URL}/${diagramType}/${format}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: code,
      });

      if (!response.ok) {
        throw new Error(`Failed to generate diagram: ${response.statusText}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setGeneratedImage(imageUrl);
      
      toast({
        title: "Success",
        description: "Diagram generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate diagram",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `diagram-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded",
      description: `Diagram saved as ${format.toUpperCase()}`,
    });
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold" data-testid="text-app-title">
            Diagram Generator
          </h1>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {isInputVisible && (
          <div className="w-full lg:w-[45%] flex flex-col border-r bg-background">
            <div className="border-b p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Diagram Type</label>
                <div className="inline-flex rounded-lg p-1 bg-muted gap-1">
                  {diagramTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.value}
                        onClick={() => handleDiagramTypeChange(type.value)}
                        variant={diagramType === type.value ? "secondary" : "ghost"}
                        size="sm"
                        className="gap-2"
                        data-testid={`button-type-${type.value}`}
                      >
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Output Format</label>
                <div className="inline-flex rounded-lg p-1 bg-muted gap-1">
                  {formatTypes.map((fmt) => (
                    <Button
                      key={fmt.value}
                      onClick={() => setFormat(fmt.value)}
                      variant={format === fmt.value ? "secondary" : "ghost"}
                      size="sm"
                      data-testid={`button-format-${fmt.value}`}
                    >
                      {fmt.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 flex flex-col overflow-hidden">
              <label className="text-sm font-medium mb-2">Diagram Code</label>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 font-mono text-sm resize-none"
                placeholder="Enter your diagram code here..."
                data-testid="input-diagram-code"
              />
            </div>

            <div className="p-6 border-t">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
                size="lg"
                data-testid="button-generate"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  "Generate Diagram"
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col bg-muted/30 relative">
          <div className="border-b p-6 bg-background">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setIsInputVisible(!isInputVisible)}
                  variant="ghost"
                  size="icon"
                  data-testid="button-toggle-input"
                  className="shrink-0"
                >
                  {isInputVisible ? (
                    <ChevronLeft className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </Button>
                <div>
                  <h2 className="text-sm font-medium">Preview</h2>
                  <p className="text-sm text-muted-foreground">
                    {diagramType.charAt(0).toUpperCase() + diagramType.slice(1)} · {format.toUpperCase()}
                  </p>
                </div>
              </div>
              {generatedImage && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 border rounded-lg p-1">
                    <Button
                      onClick={handleZoomOut}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={zoom <= 25}
                      data-testid="button-zoom-out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleZoomReset}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-xs font-medium min-w-[4rem]"
                      data-testid="button-zoom-reset"
                    >
                      {zoom}%
                    </Button>
                    <Button
                      onClick={handleZoomIn}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={zoom >= 300}
                      data-testid="button-zoom-in"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    data-testid="button-download"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 p-8 overflow-auto">
            {generatedImage ? (
              <div className="bg-background rounded-xl border shadow-lg p-6 inline-block">
                <img
                  src={generatedImage}
                  alt="Generated diagram"
                  className="max-w-full h-auto"
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
                  data-testid="img-diagram"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4" data-testid="text-empty-state">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                    <Network className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">No diagram yet</p>
                    <p className="text-sm text-muted-foreground">
                      Enter your code and click generate
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
