import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { X, Plus } from "lucide-react";

interface APTModalProps {
  open: boolean;
  onClose: () => void;
  data?: any;
  onSave: (data: any) => void;
  readOnly?: boolean;
}

interface APTRow {
  workSteps: string;
  hazards: string;
  threats: string;
  barriers: string;
}

const dailyTopics = [
  'Objetivos del trabajo',
  'Plan y Procedimientos', 
  'Responsabilidades/Supervisión',
  'Peligros',
  'Mano de Obra y Capacitación',
  'Equipo a utilizar',
  'Equipo de Protección Personal',
  'Las 3 Que\'s',
  'Permiso de Trabajo',
  'Lugar de Trabajo',
  'Otras actividades',
  'Cierre y Etiquetado',
  'Sistemas sensibles inhibidos o desconectados',
  'Vías de Evacuación'
];

export default function APTModal({ open, onClose, data, onSave, readOnly = false }: APTModalProps) {
  const [workActivityName, setWorkActivityName] = useState(data?.workActivityName || '');
  const [analysisLeader, setAnalysisLeader] = useState(data?.analysisLeader || '');
  const [aptRows, setAptRows] = useState<APTRow[]>(data?.aptRows || [
    { workSteps: '', hazards: '', threats: '', barriers: '' }
  ]);
  const [dailyTalk, setDailyTalk] = useState<Record<string, 'si' | 'no' | ''>>(
    data?.dailyTalk || {}
  );
  const [observations, setObservations] = useState(data?.observations || '');
  const [participants, setParticipants] = useState<Array<{ name: string; signature: string }>>(
    data?.participants || []
  );

  const addRow = () => {
    if (readOnly) return;
    setAptRows([...aptRows, { workSteps: '', hazards: '', threats: '', barriers: '' }]);
  };

  const updateRow = (index: number, field: keyof APTRow, value: string) => {
    if (readOnly) return;
    const updated = [...aptRows];
    updated[index] = { ...updated[index], [field]: value };
    setAptRows(updated);
  };

  const removeRow = (index: number) => {
    if (readOnly || aptRows.length <= 1) return;
    setAptRows(aptRows.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const aptData = {
      workActivityName,
      analysisLeader,
      aptRows,
      dailyTalk,
      observations,
      participants,
      date: new Date().toISOString(),
    };
    onSave(aptData);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl w-full max-h-screen overflow-y-auto" data-testid="modal-apt">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Análisis de Peligros SSMS del Trabajo (A.P.T.)
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="workActivityName">Nombre del Trabajo y/o Actividad</Label>
              <Input
                id="workActivityName"
                value={workActivityName}
                onChange={(e) => setWorkActivityName(e.target.value)}
                disabled={readOnly}
                data-testid="input-work-activity"
              />
            </div>
            <div>
              <Label htmlFor="analysisLeader">Análisis Liderizado por</Label>
              <Input
                id="analysisLeader"
                placeholder="Nombre y Apellidos"
                value={analysisLeader}
                onChange={(e) => setAnalysisLeader(e.target.value)}
                disabled={readOnly}
                data-testid="input-analysis-leader"
              />
            </div>
          </div>
          
          {/* APT Table */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Análisis de Peligros</h4>
            <div className="overflow-x-auto">
              <table className="w-full border border-border rounded-lg">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-foreground border-r border-border">
                      Etapas del Trabajo
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-foreground border-r border-border">
                      Peligros/Aspectos Identificados
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-foreground border-r border-border">
                      Amenazas
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-foreground border-r border-border">
                      Barreras/Procedimiento Seguro
                    </th>
                    {!readOnly && (
                      <th className="p-3 text-center text-sm font-semibold text-foreground">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {aptRows.map((row, index) => (
                    <tr key={index} className="border-b border-border">
                      <td className="p-3 border-r border-border">
                        <Textarea
                          className="w-full text-sm"
                          rows={3}
                          placeholder="Pasos básicos para hacer el trabajo"
                          value={row.workSteps}
                          onChange={(e) => updateRow(index, 'workSteps', e.target.value)}
                          disabled={readOnly}
                          data-testid={`textarea-work-steps-${index}`}
                        />
                      </td>
                      <td className="p-3 border-r border-border">
                        <Textarea
                          className="w-full text-sm"
                          rows={3}
                          placeholder="¿Qué trabajo(s) o situación(es) podría provocar daños?"
                          value={row.hazards}
                          onChange={(e) => updateRow(index, 'hazards', e.target.value)}
                          disabled={readOnly}
                          data-testid={`textarea-hazards-${index}`}
                        />
                      </td>
                      <td className="p-3 border-r border-border">
                        <Textarea
                          className="w-full text-sm"
                          rows={3}
                          placeholder="¿Qué condición podría originar que algo salga mal?"
                          value={row.threats}
                          onChange={(e) => updateRow(index, 'threats', e.target.value)}
                          disabled={readOnly}
                          data-testid={`textarea-threats-${index}`}
                        />
                      </td>
                      <td className="p-3 border-r border-border">
                        <Textarea
                          className="w-full text-sm"
                          rows={3}
                          placeholder="¿Qué podemos hacer para evitar que algo salga mal?"
                          value={row.barriers}
                          onChange={(e) => updateRow(index, 'barriers', e.target.value)}
                          disabled={readOnly}
                          data-testid={`textarea-barriers-${index}`}
                        />
                      </td>
                      {!readOnly && (
                        <td className="p-3 text-center">
                          {aptRows.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRow(index)}
                              className="text-red-600 hover:text-red-700"
                              data-testid={`button-remove-row-${index}`}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {!readOnly && (
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addRow}
                  data-testid="button-add-row"
                >
                  <Plus className="mr-2 w-4 h-4" />
                  Agregar Fila
                </Button>
              </div>
            )}
          </div>
          
          {/* Daily Pre-work Checklist */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Charla Diaria Previa</h4>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">Previo al trabajo se conversó de:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dailyTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm flex-1">{topic}</span>
                    <RadioGroup
                      value={dailyTalk[topic] || ''}
                      onValueChange={(value) => {
                        if (!readOnly) {
                          setDailyTalk(prev => ({ ...prev, [topic]: value as 'si' | 'no' }));
                        }
                      }}
                      className="flex space-x-2"
                      disabled={readOnly}
                    >
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="si" id={`${topic}_si`} />
                        <Label htmlFor={`${topic}_si`} className="text-xs">Sí</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="no" id={`${topic}_no`} />
                        <Label htmlFor={`${topic}_no`} className="text-xs">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Observations */}
          <div>
            <Label htmlFor="observations">Observaciones / Comentarios</Label>
            <Textarea
              id="observations"
              rows={4}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              disabled={readOnly}
              data-testid="textarea-observations"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            data-testid="button-cancel-apt"
          >
            {readOnly ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!readOnly && (
            <Button 
              onClick={handleSave}
              data-testid="button-save-apt"
            >
              Guardar APT
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
