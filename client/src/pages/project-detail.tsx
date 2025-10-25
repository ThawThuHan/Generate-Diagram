import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  Loader2, 
  Network, 
  GitBranch, 
  Workflow, 
  Pencil, 
  ZoomIn, 
  ZoomOut, 
  Save,
  ArrowLeft,
  Eye,
  Trash2,
  Menu,
  PanelLeft,
  PanelLeftClose,
  ChevronLeft,
  Plus
} from "lucide-react";
import { Link, useParams } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project, Diagram, InsertDiagram } from "@shared/schema";
import { API_URL } from "@/lib/config";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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

export default function ProjectDetail() {
  const params = useParams();
  const projectId = parseInt(params.id || "0");
  const [diagramType, setDiagramType] = useState<DiagramType>("mermaid");
  const [format, setFormat] = useState<FormatType>("svg");
  const [code, setCode] = useState(defaultExamples.mermaid);
  const [diagramName, setDiagramName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [selectedDiagram, setSelectedDiagram] = useState<Diagram | null>(null);
  const { toast } = useToast();
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const { data: project, isError: isProjectError } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
  });

  const { data: diagrams, isLoading: isLoadingDiagrams, isError: isDiagramsError } = useQuery<Diagram[]>({
    queryKey: ["/api/projects", projectId, "diagrams"],
    enabled: !!projectId,
  });

  const updateMutation = useMutation<Diagram, Error, Partial<InsertDiagram> & { id: number }>({
    mutationFn: async (data) => {
      const res = await apiRequest("PATCH", `/api/diagrams/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "diagrams"] });
      // Keep isEditing true so user can continue editing
      toast({
        title: "Success",
        description: "Diagram updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update diagram",
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InsertDiagram) => {
      const res = await apiRequest("POST", "/api/diagrams", data);
      return res.json() as Promise<Diagram>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "diagrams"] });
      setDiagramName("");
      toast({
        title: "Success",
        description: "Diagram saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save diagram",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/diagrams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "diagrams"] });
      toast({
        title: "Success",
        description: "Diagram deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete diagram",
        variant: "destructive",
      });
    },
  });

  const handleDiagramTypeChange = (type: DiagramType) => {
    if (generatedImage && generatedImage.startsWith('blob:')) {
      URL.revokeObjectURL(generatedImage);
    }
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
        throw new Error("Failed to generate diagram");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      if (generatedImage && generatedImage.startsWith('blob:')) {
        URL.revokeObjectURL(generatedImage);
      }
      
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

  const handleSaveDiagram = async () => {
    if (!generatedImage) {
      toast({
        title: "Error",
        description: "Please generate a diagram first",
        variant: "destructive",
      });
      return;
    }

    if (!diagramName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a diagram name",
        variant: "destructive",
      });
      return;
    }

    const blob = await fetch(generatedImage).then(r => r.blob());
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      saveMutation.mutate({
        projectId,
        name: diagramName,
        diagramType,
        format,
        code,
        imageData: base64data,
      });
    };
    reader.readAsDataURL(blob);
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

  const handleViewDiagram = (diagram: Diagram) => {
    setSelectedDiagram(diagram);
    setDiagramType(diagram.diagramType as DiagramType);
    setFormat(diagram.format as FormatType);
    setCode(diagram.code);
    setDiagramName(diagram.name);
    setGeneratedImage(diagram.imageData);
    setZoom(100);
    setIsEditing(false);
  };

  const handleEditDiagram = (diagram: Diagram) => {
    setSelectedDiagram(diagram);
    setDiagramType(diagram.diagramType as DiagramType);
    setFormat(diagram.format as FormatType);
    setCode(diagram.code);
    setDiagramName(diagram.name);
    setGeneratedImage(diagram.imageData);
    setZoom(100);
    setIsEditing(true);
  };

  const handleUpdateDiagram = async () => {
    if (!selectedDiagram) return;
    if (!diagramName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a diagram name",
        variant: "destructive",
      });
      return;
    }
    try {
      // Generate new image from code
      const response = await fetch(`${API_URL}/${diagramType}/${format}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: code,
      });
      if (!response.ok) {
        throw new Error("Failed to generate diagram");
      }
      const blob = await response.blob();
       const imageUrl = URL.createObjectURL(blob);
      
      if (generatedImage && generatedImage.startsWith('blob:')) {
        URL.revokeObjectURL(generatedImage);
      }
      
      setGeneratedImage(imageUrl);
      const reader = new FileReader();
      const imageData = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      updateMutation.mutate({
        id: selectedDiagram.id,
        name: diagramName,
        diagramType,
        format,
        code,
        imageData,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate diagram",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDiagram = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
      if (selectedDiagram?.id === id) {
        setSelectedDiagram(null);
      }
    }
  };

  const handleAddDiagram = () => {
    setSelectedDiagram(null);
    setDiagramType("mermaid");
    setFormat("png");
    setCode("");
    setDiagramName("");
    setGeneratedImage("");
    setZoom(100);
    setIsEditing(false);
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-project-name">
                {project?.name || "Loading..."}
              </h1>
              {project?.description && (
                <p className="text-sm text-muted-foreground">{project.description}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <div className="w-80 border-r bg-background flex flex-col transition-all duration-300" style={{ display: isSidebarVisible ? 'flex' : 'none' }}>
          <div className="p-4 border-b">
            <h2 className="font-semibold">Saved Diagrams</h2>
            <p className="text-sm text-muted-foreground">
              {diagrams?.length || 0} diagram{diagrams?.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {isLoadingDiagrams ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : isDiagramsError ? (
              <div className="text-center py-8" data-testid="text-diagrams-error">
                <p className="text-sm text-destructive font-medium">
                  Failed to load diagrams
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please try again
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="mt-3"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "diagrams"] })}
                >
                  Retry
                </Button>
              </div>
            ) : diagrams && diagrams.length > 0 ? (
              diagrams.map((diagram) => (
                <Card 
                  key={diagram.id} 
                  className={`hover-elevate cursor-pointer ${selectedDiagram?.id === diagram.id ? 'border-primary' : ''}`}
                  onClick={() => handleViewDiagram(diagram)}
                  data-testid={`card-diagram-${diagram.id}`}
                >
                  <CardHeader className="p-4 space-y-1">
                    <CardTitle className="text-sm line-clamp-1">{diagram.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {diagram.diagramType} · {diagram.format.toUpperCase()}
                    </CardDescription>
                    <CardDescription className="text-xs">
                      {formatDistanceToNow(new Date(diagram.createdAt), { addSuffix: true })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex gap-1">
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDiagram(diagram);
                        }}
                        data-testid={`button-view-diagram-${diagram.id}`}
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button> */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditDiagram(diagram);
                        }}
                        data-testid={`button-edit-diagram-${diagram.id}`}
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDiagram(diagram.id, diagram.name);
                        }}
                        data-testid={`button-delete-diagram-${diagram.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No diagrams yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create and save your first diagram
                </p>
              </div>
            )}
          </div>
          <div className="p-4 border-t">
            <Button
                className="w-full gap-2"
                onClick={handleAddDiagram}
                size="lg"
                data-testid="button-generate"
              >
                <Plus className="w-5 h-5" />
                 Add Diagram
              </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex flex-wrap">
            <div className="flex flex-col border-b p-6 space-y-4 border-r">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                data-testid="button-toggle-sidebar"
              >
                {isSidebarVisible ? (
                  <PanelLeftClose className="w-5 h-5" />
                ) : (
                  <PanelLeft className="w-5 h-5" />
                )}
              </Button>
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

              <div className="flex flex-col h-full">
                <label className="text-sm font-medium mb-2">Diagram Code</label>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 font-mono text-sm resize-none h-full"
                  placeholder="Enter your diagram code here..."
                  data-testid="input-diagram-code"
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-muted/30">
              <div className="border-b p-4 bg-background">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h3 className="text-sm font-medium">Preview</h3>
                  {generatedImage && (
                    <div className="flex items-center gap-2 flex-wrap">
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
                <div>
                  <Button
                    variant={"outline"}
                    size="sm"
                    className="mt-2"
                    onClick={() => setIsFullscreenOpen(true)}
                    disabled={!generatedImage}
                    data-testid="button-fullscreen"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Full Screen
                  </Button>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-auto">
                {generatedImage ? (
                  <div 
                  className="bg-background rounded-xl border shadow-lg p-6 inline-block"
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
                  >
                    <img
                      src={generatedImage}
                      alt="Generated diagram"
                      className="max-w-full h-auto"
                      // style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
                      data-testid="img-diagram"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                        <Network className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">No preview yet</p>
                        <p className="text-sm text-muted-foreground">
                          Generate your diagram to see the preview
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-2 flex border-t p-6 bg-background">
            <div className="flex items-end gap-4 flex-wrap w-full justify-between">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="diagram-name">Diagram Name</Label>
                <Input
                  id="diagram-name"
                  placeholder="My diagram"
                  value={diagramName}
                  onChange={(e) => setDiagramName(e.target.value)}
                  data-testid="input-diagram-name"
                />
              </div>
              <div className="flex items-center gap-4 flex-wrap justify-between md:w-auto w-full">
                <Button
                onClick={handleGenerate}
                disabled={isGenerating || selectedDiagram !== null}
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
              {isEditing ? (
                <Button
                  onClick={handleUpdateDiagram}
                  disabled={!selectedDiagram || updateMutation.isPending}
                  size="lg"
                  variant="default"
                  className="gap-2"
                  data-testid="button-update-diagram"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Update Diagram
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleSaveDiagram}
                  disabled={!generatedImage || saveMutation.isPending || selectedDiagram !== null}
                  size="lg"
                  variant="default"
                  className="gap-2"
                  data-testid="button-save-diagram"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Diagram
                    </>
                  )}
                </Button>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 overflow-hidden" data-testid="dialog-fullscreen">
          <div className="h-full flex flex-col">
            <div className="border-b p-4 bg-background">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Button
                    variant="outline"
                    onClick={() => setIsFullscreenOpen(false)}
                    className="gap-2"
                    data-testid="button-close-fullscreen"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Full Screen Preview</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 border rounded-lg">
                    <Button
                      onClick={handleZoomOut}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={zoom <= 25}
                      data-testid="button-fullscreen-zoom-out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleZoomReset}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-xs font-medium"
                      data-testid="button-fullscreen-zoom-reset"
                    >
                      {zoom}%
                    </Button>
                    <Button
                      onClick={handleZoomIn}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={zoom >= 300}
                      data-testid="button-fullscreen-zoom-in"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 gap-2"
                    data-testid="button-fullscreen-download"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-auto inline-block bg-muted p-6">
                {generatedImage && (
                  <div
                    className="bg-background rounded-xl border shadow-lg p-6 inline-block"
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
                  >
                    <img
                      src={generatedImage}
                      alt="Generated diagram"
                      className="max-w-full h-auto"
                      data-testid="img-fullscreen-diagram"
                    />
                  </div>
                )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
