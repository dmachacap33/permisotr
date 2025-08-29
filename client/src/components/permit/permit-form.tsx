import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { permitBasicInfoSchema } from "@shared/schema";
import { getPermitTypeConfig } from "@/lib/permits";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import APTModal from "./apt-modal";
import PhotoCapture from "./photo-capture";
import {
  Info,
  Shield,
  Camera,
  UserCheck,
  ClipboardList,
  Save,
  Eye,
  Send
} from "lucide-react";
import { z } from "zod";
import type { User } from "@shared/schema";

interface PermitFormProps {
  permitType: string;
  initialData?: any;
  onSave: (data: any, isDraft?: boolean) => void;
  onSubmitForValidation?: (validatorId: string, comments?: string) => void;
  isLoading?: boolean;
  canEdit?: boolean;
  canValidate?: boolean;
  canApprove?: boolean;
  readOnly?: boolean;
}

const formSchema = permitBasicInfoSchema.extend({
  checklistResponses: z.record(z.enum(['si', 'no', 'na'])).optional(),
  ppeRequirements: z.array(z.string()).optional(),
  aptAnalysis: z.any().optional(),
  photos: z.array(z.string()).optional(),
  specialInstructions: z.string().optional(),
  gasDetectionReading: z.string().optional(),
  validatedBy: z.string().optional(),
  approvedBy: z.string().optional(),
});

export default function PermitForm({
  permitType,
  initialData,
  onSave,
  onSubmitForValidation,
  isLoading = false,
  canEdit = true,
  canValidate = false,
  canApprove = false,
  readOnly = false
}: PermitFormProps) {
  const [showAPT, setShowAPT] = useState(false);
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || []);
  const [aptData, setAptData] = useState(initialData?.aptAnalysis || null);
  const [userOptions, setUserOptions] = useState<User[]>([]);

  const config = getPermitTypeConfig(permitType);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      executorCompany: initialData?.executorCompany || '',
      stationDuct: initialData?.stationDuct || '',
      areaSite: initialData?.areaSite || '',
      workOrderNumber: initialData?.workOrderNumber || '',
      workDescription: initialData?.workDescription || '',
      workDate: initialData?.workDate ? new Date(initialData.workDate) : new Date(),
      validFrom: initialData?.validFrom || '',
      validTo: initialData?.validTo || '',
      checklistResponses: initialData?.checklistResponses || {},
      ppeRequirements: initialData?.ppeRequirements || [],
      specialInstructions: initialData?.specialInstructions || '',
      gasDetectionReading: initialData?.gasDetectionReading || '',
      validatedBy: initialData?.validatedBy || '',
      approvedBy: initialData?.approvedBy || '',
    }
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUserOptions(data);
        }
      } catch (e) {
        console.error('Failed to load users', e);
      }
    };
    fetchUsers();
  }, []);

  const onSubmit = (data: any) => {
    const formData = {
      ...data,
      photos,
      aptAnalysis: aptData,
      workDate: data.workDate.toISOString(),
    };
    onSave(formData, true); // Save as draft
  };

  const onSubmitForValidationClick = () => {
    const data = form.getValues();
    const formData = {
      ...data,
      photos,
      aptAnalysis: aptData,
      workDate: data.workDate.toISOString(),
    };
    // Save current data then send for validation to specific validator
    onSave(formData, false);
    onSubmitForValidation?.(data.validatedBy || '', 'Enviado para validación');
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 permit-form-container">
          
          {/* Basic Information */}
          <Card className="form-section" data-testid="card-basic-info">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Info className="text-primary mr-2 w-5 h-5" />
                Información Básica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="executorCompany"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa / Ejecutor del Trabajo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nombre completo del ejecutor" 
                          {...field}
                          disabled={readOnly}
                          data-testid="input-executor-company"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stationDuct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estación / Ducto</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ubicación del trabajo" 
                          {...field}
                          disabled={readOnly}
                          data-testid="input-station-duct"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="areaSite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área / Sitio</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Área específica" 
                          {...field}
                          disabled={readOnly}
                          data-testid="input-area-site"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="workOrderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orden de Trabajo No.</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Número de orden" 
                          {...field}
                          disabled={readOnly}
                          data-testid="input-work-order"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="workDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción del Trabajo</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descripción detallada del trabajo a realizar" 
                            rows={3}
                            {...field}
                            disabled={readOnly}
                            data-testid="textarea-work-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="workDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field}
                          value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          disabled={readOnly}
                          data-testid="input-work-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="validFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Válido desde</FormLabel>
                          <FormControl>
                            <Input 
                              type="time"
                              {...field}
                              disabled={readOnly}
                              data-testid="input-valid-from"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="validTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hasta</FormLabel>
                          <FormControl>
                            <Input 
                              type="time"
                              {...field}
                              disabled={readOnly}
                              data-testid="input-valid-to"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>

        {/* Responsible Persons */}
        <Card className="form-section" data-testid="card-responsibles">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <UserCheck className="text-primary mr-2 w-5 h-5" />
              Responsables
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="validatedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validador</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={readOnly}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-validator">
                          <SelectValue placeholder="Selecciona validador" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {userOptions.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.firstName ? `${u.firstName} ${u.lastName}` : u.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="approvedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supervisor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={readOnly}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-supervisor">
                          <SelectValue placeholder="Selecciona supervisor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {userOptions.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.firstName ? `${u.firstName} ${u.lastName}` : u.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Safety Checklist */}
        <Card className="form-section" data-testid="card-safety-checklist">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Shield className="text-green-600 mr-2 w-5 h-5" />
              Lista de Verificación de Seguridad
              </h3>
              
              <div className="space-y-3">
                {config.checklist.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-gray-50 transition-colors"
                    data-testid={`checklist-item-${index}`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {index + 1}. {item}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 ml-4">
                      <FormField
                        control={form.control}
                        name={`checklistResponses.${index}`}
                        render={({ field }) => (
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center space-x-4"
                            disabled={readOnly}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="si" id={`check_${index}_si`} />
                              <Label htmlFor={`check_${index}_si`} className="text-sm">Sí</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="na" id={`check_${index}_na`} />
                              <Label htmlFor={`check_${index}_na`} className="text-sm">N/A</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Photo Documentation */}
          <Card className="form-section" data-testid="card-photo-documentation">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Camera className="text-blue-600 mr-2 w-5 h-5" />
                Documentación Fotográfica
              </h3>
              
              <PhotoCapture
                photos={photos}
                onPhotosChange={setPhotos}
                disabled={readOnly}
              />
            </CardContent>
          </Card>

          {/* PPE Requirements */}
          <Card className="form-section" data-testid="card-ppe-requirements">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <UserCheck className="text-orange-600 mr-2 w-5 h-5" />
                Equipo de Protección Personal Requerido
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {config.ppe.map((item, index) => (
                  <FormField
                    key={index}
                    control={form.control}
                    name={`ppeRequirements.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={form.watch('ppeRequirements')?.includes(item)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues('ppeRequirements') || [];
                              if (checked) {
                                form.setValue('ppeRequirements', [...current, item]);
                              } else {
                                form.setValue('ppeRequirements', current.filter((i: string) => i !== item));
                              }
                            }}
                            disabled={readOnly}
                            data-testid={`ppe-${index}`}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {item}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* APT Analysis */}
          <Card className="form-section" data-testid="card-apt-analysis">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <ClipboardList className="text-red-600 mr-2 w-5 h-5" />
                Análisis de Peligros del Trabajo (A.P.T.)
              </h3>
              
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">
                  Complete el análisis de peligros identificando las etapas del trabajo, peligros asociados, amenazas y barreras de control.
                </p>
                <Button 
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAPT(true)}
                  disabled={readOnly}
                  data-testid="button-open-apt"
                >
                  <ClipboardList className="mr-2 w-4 h-4" />
                  {aptData ? 'Editar Análisis APT' : 'Iniciar Análisis APT'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          <Card className="form-section" data-testid="card-special-instructions">
            <CardContent className="p-6">
              <FormField
                control={form.control}
                name="specialInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instrucciones Especiales</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Instrucciones adicionales especiales..." 
                        rows={3}
                        {...field}
                        disabled={readOnly}
                        data-testid="textarea-special-instructions"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {!readOnly && (
            <Card className="form-section sticky bottom-0 bg-background shadow-lg border-t">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                    {canEdit && (
                      <Button 
                        type="button"
                        variant="outline"
                        disabled={isLoading}
                        onClick={() => {
                          const formData = form.getValues();
                          const processedData = {
                            ...formData,
                            workDate: formData.workDate.toISOString(),
                            photos,
                            aptAnalysis: aptData,
                          };
                          onSave && onSave(processedData, true);
                        }}
                        data-testid="button-save-draft"
                        className="w-full sm:w-auto"
                      >
                        <Save className="mr-2 w-4 h-4" />
                        {isLoading ? 'Guardando...' : 'Guardar Borrador'}
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                    <Button 
                      type="button"
                      variant="outline"
                      data-testid="button-preview"
                      className="w-full sm:w-auto"
                    >
                      <Eye className="mr-2 w-4 h-4" />
                      Vista Previa
                    </Button>
                    
                    {canEdit && onSubmitForValidation && (
                      <Button 
                        type="button"
                        onClick={onSubmitForValidationClick}
                        disabled={isLoading}
                        data-testid="button-submit-validation"
                        className="w-full sm:w-auto"
                      >
                        <Send className="mr-2 w-4 h-4" />
                        Enviar para Validación
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>

      {/* Spacer for mobile devices */}
      <div className="h-20"></div>

      <APTModal
        open={showAPT}
        onClose={() => setShowAPT(false)}
        data={aptData}
        onSave={setAptData}
        readOnly={readOnly}
      />
    </>
  );
}
