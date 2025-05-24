import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Car, Mail, Phone } from "lucide-react";
import { IPlanResponse, ITaskList } from "../interfaces/interfaces";
import { useEffect, useState } from "react";
import { getPlanById, getTaskById, updateTaskById } from "@/utils/api";
import { Avatar } from "@mui/material";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchOrderUsers } from "@/modules/Orders/apis/apis";
import { toast } from "react-toastify";

interface RequestDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: ITaskList | null;
  loadData: () => void;
}

const RequestDetailDialog: React.FC<RequestDetailDialogProps> = ({
  isOpen,
  onClose,
  task,
  loadData,
}) => {
  const [order, setOrder] = useState<any | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  useEffect(() => {
    const loadTaskAndOrder = async () => {
      if (task) {
        try {
          const taskData = await getTaskById(task.id);
          setSelectedTask(taskData);
          setOrder(taskData?.order || null);
        } catch (error) {
          console.error("Error fetching task or order:", error);
          setSelectedTask(task);
          setOrder(null);
        }
      } else {
        setSelectedTask(null);
        setOrder(null);
      }
    };

    loadTaskAndOrder();
  }, [task]);

  const renderTaskLayout = () => {
    if (!selectedTask) return null;

    switch (selectedTask.type) {
      case 10:
      case 20:
        return (
          <DeliveryAndCancelLayout
            selectedTask={selectedTask}
            order={order}
            loadData={loadData}
          />
        );
      case 30:
        return (
          <SwapCarLayout
            selectedTask={selectedTask}
            order={order}
            loadData={loadData}
          />
        );
      case 40:
      case 50:
        return (
          <MaintenanceLayout
            selectedTask={selectedTask}
            order={order}
            loadData={loadData}
          />
        );
      default:
        return (
          <p className="text-sm text-gray-500">
            No additional details available for this task.
          </p>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full md:max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide px-10">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4 w-7/8 justify-between">
            <DialogTitle className="text-xl font-sans">
              {selectedTask?.type === 10
                ? "DELIVERY"
                : selectedTask?.type === 20
                ? "CANCEL SUBSCRIPTION"
                : selectedTask?.type === 30
                ? "SWAP CAR"
                : selectedTask?.type === 40
                ? "MAINTENANCE DELIVERY"
                : selectedTask?.type === 50
                ? "MAINTENANCE RETURN"
                : "Request"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Request Date:{" "}
              {selectedTask?.createdAt
                ? new Date(selectedTask.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                : "N/A"}
            </DialogDescription>
            <DialogDescription className="text-sm text-muted-foreground">
              ID#: {selectedTask?.id || "N/A"}
            </DialogDescription>
            <DialogDescription className="text-sm text-muted-foreground">
              <div className="flex items-center">
                Status:{" "}
                {selectedTask?.status ? (
                  <div className="flex items-center">
                    <div
                      className={`rounded-full w-2 h-2 mr-1 ${
                        selectedTask.status === 10
                          ? "bg-yellow-500"
                          : selectedTask.status === 20
                          ? "bg-blue-500"
                          : selectedTask.status === 25
                          ? "bg-purple-500"
                          : selectedTask.status === 30
                          ? "bg-green-600"
                          : selectedTask.status === 40
                          ? "bg-gray-500"
                          : "bg-gray-300"
                      }`}
                    />
                    {selectedTask.statusName}
                  </div>
                ) : (
                  "N/A"
                )}
              </div>
            </DialogDescription>
          </div>
        </DialogHeader>
        <Separator />
        {renderTaskLayout()}
      </DialogContent>
    </Dialog>
  );
};

const DeliveryAndCancelLayout: React.FC<{
  selectedTask: ITaskList;
  order: any;
  loadData: () => void;
}> = ({ selectedTask, order, loadData }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    orderId: 0,
    relatedId: 0,
    assigneeId: 0,
    deliveryCarId: 0,
    returnCarId: 0,
    status: 0,
    scheduleDate: "",
    scheduleTime: "",
    scheduleLocation: "",
    actuallyTime: "",
    requestBy: "",
    notes: "",
    metadata: {},
  });

  // Sync formState with selectedTask when selectedTask changes
  useEffect(() => {
    setFormState({
      orderId: selectedTask?.orderId ?? undefined,
      relatedId: selectedTask?.relatedId ?? undefined,
      assigneeId: selectedTask?.assigneeId ?? undefined,
      deliveryCarId: selectedTask?.deliveryCarId ?? undefined,
      returnCarId: selectedTask?.returnCarId ?? undefined,
      status: selectedTask?.status ?? undefined,
      scheduleDate: selectedTask?.scheduleDate
        ? new Date(selectedTask.scheduleDate).toISOString().split("T")[0]
        : "",
      scheduleTime: selectedTask?.scheduleTime || "",
      scheduleLocation: selectedTask?.scheduleLocation || "",
      actuallyTime: selectedTask?.actuallyTime || "",
      requestBy: selectedTask?.requestBy || "",
      notes: selectedTask?.notes || "",
      metadata: selectedTask?.metadata || {},
    });
  }, [selectedTask]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const loadUsers = async () => {
    try {
      const usersData = await fetchOrderUsers();
      setUsers(usersData || []);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    try {
      console.log("formState", formState);
      console.log("selectedTask", selectedTask);
      const apiPayload = {
        ...formState,
        returnCarId: formState.returnCarId ? formState.returnCarId : undefined,
        assigneeId: formState.assigneeId
          ? parseInt(formState.assigneeId, 10)
          : undefined,
        actuallyTime: formState.actuallyTime
          ? new Date(formState.actuallyTime).toISOString()
          : undefined,
        scheduleDate: formState.scheduleDate
          ? new Date(formState.scheduleDate).toISOString()
          : undefined,
        scheduleTime: formState.scheduleTime,
      };
      await updateTaskById(selectedTask.id, apiPayload);
      toast.success("Task updated successfully!");
      loadData();
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update task.");
      console.error("Error saving task:", error);
    }
  };

  const handleCancel = () => {
    setFormState({
      assigneeId: selectedTask?.assigneeId || "",
      scheduleDate: selectedTask?.scheduleDate
        ? new Date(selectedTask.scheduleDate).toISOString().split("T")[0]
        : "",
      scheduleLocation: selectedTask?.scheduleLocation || "",
      actuallyTime: selectedTask?.actuallyTime
        ? new Date(selectedTask.actuallyTime).toISOString().split("T")[0]
        : "",
      requestBy: selectedTask?.requestBy || "",
      notes: selectedTask?.notes || "", // Reset to original notes if available
      scheduleTime: selectedTask?.scheduleTime
        ? new Date(selectedTask.scheduleTime)
            .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            .slice(0, 5)
        : "",
    });
    setIsEditing(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="space-y-2">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-blue-600 rounded" />
          <h3 className="font-medium">Order Details</h3>
        </div>
        <div className="grid grid-cols-6 grid-rows-2 gap-4">
          <div className="col-span-2 row-span-2">
            <img
              src={
                selectedTask?.vehicle?.coverImage ??
                "/src/assets/car_models/car_model_1_big.png"
              }
              alt={
                selectedTask?.vehicle?.make
                  ? `${selectedTask?.vehicle?.make} ${selectedTask?.vehicle?.model}`
                  : "Vehicle Image"
              }
            />
          </div>
          <div className="col-span-4 col-start-3">
            <div className="grid grid-cols-4 gap-4 p-4 bg-[#f6f7fb] rounded-lg">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Plan:</span>
                <span className="text-xs">{order?.serviceTypeName}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  Started Date:
                </span>
                <span className="text-xs">
                  {order?.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : "N/A"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  Order Number:
                </span>
                <span className="text-xs">{order?.id || "N/A"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Status:</span>
                <div className="flex items-center gap-1">
                  {order?.status ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-green-600" />
                      <span className="text-xs">{order?.statusName}</span>
                    </>
                  ) : (
                    <span className="text-xs">N/A</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-4 col-start-3 row-start-2 gap-4 border-b-[0.1px]">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-row gap-4 p-1 px-4">
                <Avatar
                  alt={selectedTask?.user?.username}
                  src={selectedTask?.user?.picture}
                  className="h-10 w-10"
                />
                <div className="flex flex-col gap-2">
                  <div className="text-xs">
                    {selectedTask?.user?.firstName}{" "}
                    {selectedTask?.user?.lastName}
                  </div>
                  <div className="text-xs flex flex-row gap-1 text-gray-500">
                    <span>UID:</span>
                    {selectedTask?.user?.id}
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-4 p-1 px-4 border-l">
                <div className="flex flex-col gap-4 items-center justify-center">
                  <div className="text-xs flex flex-col text-gray-500 gap-2">
                    <span className="flex flex-row gap-3">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-black">
                        {selectedTask?.user?.phone}
                      </span>
                    </span>
                    <span className="flex flex-row gap-3">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-black">
                        {selectedTask?.user?.email}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-6 grid-rows-1 gap-4 text-xs text-gray-500 mt-2 p-2 border-b py-4">
          <div className="col-span-2 flex flex-col gap-1">
            <span>Vehicle Make/Model</span>
            <span className="text-black">
              {selectedTask?.vehicle?.make} {selectedTask?.vehicle?.model}
            </span>
          </div>
          <div className="col-span-1 flex flex-col gap-1">
            <span>Vin Number</span>
            <span className="text-black">
              {selectedTask?.vehicle?.vin?.length &&
              selectedTask.vehicle.vin.length > 10
                ? `${selectedTask?.vehicle?.vin?.substring(0, 10)}...`
                : selectedTask?.vehicle?.vin}
            </span>
          </div>
          <div className="col-span-1 flex flex-col gap-1">
            <span>Plate Number</span>
            <span className="text-black border border-[#0A12244D] rounded-md px-1 text-center">
              {selectedTask?.vehicle?.plateNumber?.length > 10
                ? `${selectedTask?.vehicle?.plateNumber?.substring(0, 10)}...`
                : selectedTask?.vehicle?.plateNumber}
            </span>
          </div>
          <div className="col-span-1 flex flex-col gap-1">
            <span>Vehicle Type</span>
            <span className="text-black">
              {selectedTask?.vehicle?.category}
            </span>
          </div>
          <div className="col-span-1 flex flex-col gap-1">
            <span>Location</span>
            <span className="text-black">
              {selectedTask?.vehicle?.garage?.name}
            </span>
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-blue-600 rounded" />
          <h3 className="font-medium">Request Details</h3>
        </div>
        <div className="grid grid-cols-3 gap-7">
          <div className="flex flex-col">
            <div>
              <Label className="text-xs text-muted-foreground">
                Request Type
              </Label>
              <Input
                className="h-8 disabled:bg-[#f6f7fb] text-xs text-left p-2 file:text-xs"
                type="text"
                readOnly
                disabled
                value={selectedTask?.typeName}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Schedule Date
              </Label>
              <Input
                className="h-8 disabled:bg-[#f6f7fb] text-xs text-left p-2 file:text-xs w-full items-center inline-grid"
                type="date"
                name="scheduleDate"
                value={formState.scheduleDate}
                onChange={handleInputChange} // Allow editing when in edit mode
                disabled={!isEditing}
              />
            </div>
          </div>
          <div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Request By
              </Label>
              <Input
                className="h-8 disabled:bg-[#f6f7fb] text-xs text-left p-2 file:text-xs"
                type="text"
                readOnly
                disabled
                value={selectedTask?.requestBy}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Schedule Location
              </Label>
              <Input
                className="h-8 disabled:bg-[#f6f7fb] text-xs text-left p-2 file:text-xs w-full"
                type="text"
                name="scheduleLocation"
                value={formState.scheduleLocation}
                onChange={handleInputChange} // Allow editing when in edit mode
                disabled={!isEditing}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Textarea
              className="text-xs text-left p-2 h-4/5"
              name="notes"
              value={formState.notes}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>
      <br />
      <fieldset className="border border-[#0A12244D] border-dashed rounded-lg px-3 pt-2 pb-3">
        <legend className="text-xs text-gray-500 ml-3 bg-white px-2">
          Vehicle Delivery
        </legend>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Assign To</Label>
            <Select
              onValueChange={(value) =>
                setFormState((prev) => ({ ...prev, assigneeId: value }))
              }
              value={formState.assigneeId?.toString() || ""}
              disabled={!isEditing}
            >
              <SelectTrigger className="h-8 text-xs text-left p-2 w-full">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              Delivered Date
            </Label>
            <Input
              className="h-8 disabled:bg-[#f6f7fb] text-xs text-left p-2 file:text-xs w-full items-center inline-grid"
              type="date"
              name="actuallyTime"
              value={formState.actuallyTime}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div className="flex flex-col justify-between">
            <Label className="text-xs text-muted-foreground">
              Inspection Report
            </Label>
            <span className="text-xs pb-2">Case Number: </span>
          </div>
        </div>
      </fieldset>
      <br />
      <div className="flex justify-between">
        <div />
        <div className="flex gap-4">
          {!isEditing ? (
            <Button variant="outline" size="lg" onClick={handleEdit}>
              Edit
            </Button>
          ) : (
            <>
              <Button variant="outline" size="lg" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="lg" onClick={handleSave}>
                Save
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface IVehicle {
  id: string;
  make: string;
  model: string;
  vin: string;
  plateNumber: string;
  status: string;
  coverImage: string;
}

const SwapCarLayout: React.FC<{
  selectedTask: ITaskList;
  order: any;
  loadData: () => void;
}> = ({ selectedTask, order, loadData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [swapVehicle, setSwapVehicle] = useState<IVehicle | null>(null);
  const [plan, setPlan] = useState<IPlanResponse | null>(null);
  const [formState, setFormState] = useState({
    scheduleDate: selectedTask?.scheduleDate || "",
    scheduleLocation: selectedTask?.scheduleLocation || "",
    notes: selectedTask?.notes || "",
  });

  const fetchAvailableVehicles = async () => {
    try {
      const planId = (selectedTask?.metadata as any)?.planId;
      if (!planId) {
        console.warn("No planId found in selectedTask.metadata");
        return;
      }

      const fetchedPlan: IPlanResponse = await getPlanById(planId);
      setPlan(fetchedPlan);

      const vehicleId = (selectedTask?.metadata as any)?.vehicleId;
      const matchedVehicle = fetchedPlan?.planVehicles?.find(
        (vehicle) => vehicle?.vehicle?.id === vehicleId
      )?.vehicle;

      if (matchedVehicle) {
        setSwapVehicle(matchedVehicle);
      } else {
        console.warn("No matching vehicle found in planVehicles");
      }
    } catch (error) {
      console.error("Error fetching available vehicles:", error);
    }
  };

  useEffect(() => {
    fetchAvailableVehicles();
  }, [selectedTask]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setFormState({
      scheduleDate: selectedTask?.scheduleDate || "",
      scheduleLocation: selectedTask?.scheduleLocation || "",
      notes: selectedTask?.notes || "",
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const apiPayload = {
        ...selectedTask,
        scheduleDate: formState.scheduleDate
          ? new Date(formState.scheduleDate).toISOString()
          : undefined,
        scheduleLocation: formState.scheduleLocation,
        notes: formState.notes,
      };
      await updateTaskById(selectedTask.id, apiPayload);
      toast.success("Swap task updated successfully!");
      loadData();
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update swap task.");
      console.error("Error saving swap task:", error);
    }
  };

  return (
    <div className="rounded-lg space-y-6">
      <div className="flex items-center gap-2">
        <Car className="w-5 h-5 text-blue-600" />
        <h3 className="font-medium text-lg">Car Swap Details</h3>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-medium text-sm mb-3">Current Vehicle</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <img
              src={selectedTask?.vehicle?.coverImage || "/placeholder-car.jpg"}
              alt="Current vehicle"
              className="w-full object-cover rounded-md"
            />
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Make/Model: </span>
              <span>
                {selectedTask?.vehicle?.make} {selectedTask?.vehicle?.model}
              </span>
            </div>
            <div>
              <span className="text-gray-500">VIN: </span>
              <span>{selectedTask?.vehicle?.vin}</span>
            </div>
            <div>
              <span className="text-gray-500">Plate: </span>
              <span>{selectedTask?.vehicle?.plateNumber}</span>
            </div>
            <div>
              <span className="text-gray-500">Location: </span>
              <span>{selectedTask?.vehicle?.garage?.name}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-medium text-sm mb-3">Replacement Vehicle/Plan</h4>
        <div className="space-y-4">
          {plan && (
            <div className="grid grid-cols-2 gap-4">
              {swapVehicle?.coverImage && (
                <img
                  src={swapVehicle?.coverImage || "/placeholder-car.jpg"}
                  alt="Replacement vehicle"
                  className="w-full h-32 object-cover rounded-md"
                />
              )}
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Make: </span>
                  <span>{swapVehicle?.make}</span>
                </div>
                <div>
                  <span className="text-gray-500">Plate Number: </span>
                  <span>{swapVehicle?.plateNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500">Plan Name: </span>
                  <span>{plan?.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Plan Description: </span>
                  <span>{plan?.description}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-medium text-sm mb-3">Swap Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-gray-500">Swap Date</Label>
            <Input
              type="date"
              name="scheduleDate"
              value={
                formState.scheduleDate
                  ? formState.scheduleDate.split("T")[0]
                  : ""
              }
              onChange={handleInputChange}
              disabled={!isEditing}
              className="h-9 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Swap Location</Label>
            <Input
              type="text"
              name="scheduleLocation"
              value={formState.scheduleLocation}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="h-9 text-sm"
            />
          </div>
          <div className="col-span-2">
            <Label className="text-xs text-gray-500">Notes</Label>
            <Textarea
              name="notes"
              value={formState.notes}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="text-sm"
            />
          </div>
        </div>
      </div>
      <Separator />
      <div className="flex justify-end gap-4">
        {!isEditing ? (
          <Button variant="outline" onClick={handleEdit}>
            Edit Swap Details
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Swap</Button>
          </>
        )}
        <Button variant="destructive">Cancel Request</Button>
      </div>
    </div>
  );
};

const MaintenanceLayout: React.FC<{
  selectedTask: ITaskList;
  order: any;
  loadData: () => void;
}> = ({ selectedTask, order, loadData }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    orderId: "",
    relatedId: "",
    assigneeId: "",
    deliveryCarId: "",
    returnCarId: "",
    status: "",
    scheduleDate: "",
    scheduleLocation: "",
    actuallyTime: "",
    requestBy: "",
    scheduleTime: "",
    metadata: {},
    notes: "",
  });

  useEffect(() => {
    setFormState({
      orderId: selectedTask?.orderId || "",
      relatedId: selectedTask?.relatedId || "",
      assigneeId: selectedTask?.assigneeId || "",
      deliveryCarId: selectedTask?.deliveryCarId || "", // Ensure this is included
      returnCarId: selectedTask?.returnCarId || "",
      status: selectedTask?.status || "",
      scheduleDate: selectedTask?.scheduleDate || "",
      scheduleLocation: selectedTask?.scheduleLocation || "",
      actuallyTime: selectedTask?.actuallyTime || "",
      requestBy: selectedTask?.requestBy || "",
      scheduleTime: selectedTask?.scheduleTime || "",
      metadata: selectedTask?.metadata || {},
      notes: selectedTask?.notes || "",
    });
  }, [selectedTask]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const loadUsers = async () => {
    try {
      const usersData = await fetchOrderUsers();
      setUsers(usersData || []);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("formState", formState);
    const apiPayload = {
      ...formState,
      orderId: formState.orderId ? parseInt(formState.orderId, 10) : undefined,
      assigneeId: formState.assigneeId
        ? parseInt(formState.assigneeId, 10)
        : undefined,
      deliveryCarId: formState.deliveryCarId
        ? parseInt(formState.deliveryCarId, 10)
        : undefined,
      returnCarId: formState.returnCarId
        ? parseInt(formState.returnCarId, 10)
        : undefined,
      scheduleDate: formState.scheduleDate
        ? new Date(formState.scheduleDate).toISOString()
        : undefined,
      scheduleTime: formState.scheduleTime
        ? new Date(`1970-01-01T${formState.scheduleTime}:00Z`)
        : undefined,
      actuallyTime: formState.actuallyTime
        ? new Date(formState.actuallyTime).toISOString()
        : undefined,
    };

    try {
      console.log("selectedTask", selectedTask);
      console.log("formState", formState);
      console.log("apiPayload", apiPayload);
      await updateTaskById(selectedTask.id, apiPayload);
      toast.success("Task updated successfully!");
      loadData();
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update task. Please try again.");
      console.error("Failed to update task:", error);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setFormState({
      orderId: selectedTask?.orderId || "",
      relatedId: selectedTask?.relatedId || "",
      assigneeId: selectedTask?.assigneeId || "",
      deliveryCarId: selectedTask?.deliveryCarId || "",
      returnCarId: selectedTask?.returnCarId || "",
      status: selectedTask?.status || "",
      scheduleDate: selectedTask?.scheduleDate || "",
      scheduleLocation: selectedTask?.scheduleLocation || "",
      actuallyTime: selectedTask?.actuallyTime || "",
      requestBy: selectedTask?.requestBy || "",
      scheduleTime: selectedTask?.scheduleTime || "",
      metadata: selectedTask?.metadata || {},
      notes: selectedTask?.notes || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-blue-600 rounded" />
          <h3 className="font-medium">Vehicle Details</h3>
        </div>
        <div className="grid grid-cols-7 grid-rows-2 gap-4 text-xs mb-4">
          <div className="col-span-2 row-span-2">
            <img
              src={
                selectedTask?.vehicle?.coverImage ??
                "/src/assets/car_models/car_model_1_big.png"
              }
              alt={
                selectedTask?.vehicle?.make
                  ? `${selectedTask?.vehicle?.make} ${selectedTask?.vehicle?.model}`
                  : "Vehicle Image"
              }
            />
          </div>
          <div className="col-span-2 col-start-3 gap-1">
            <LabeledText
              label="Vehicle Make/Model"
              value={`${selectedTask?.vehicle?.make} ${selectedTask?.vehicle?.model}`}
            />
          </div>
          <div className="col-start-5 flex flex-col gap-1">
            <span>Plate Number</span>
            <span className="text-black border border-[#0A12244D] rounded-md px-1 text-center">
              {selectedTask?.vehicle?.plateNumber?.length > 10
                ? `${selectedTask?.vehicle?.plateNumber?.substring(0, 10)}...`
                : selectedTask?.vehicle?.plateNumber}
            </span>
          </div>
          <div className="col-start-6">
            <LabeledText
              label="Odometer"
              value={
                selectedTask?.vehicle?.odometer
                  ? `${selectedTask?.vehicle?.odometer} km`
                  : "N/A"
              }
            />
          </div>
          <div className="col-start-7 flex flex-col">
            <span>Vehicle Type</span>
            <span className="text-black">
              {selectedTask?.vehicle?.category}
            </span>
          </div>
          <div className="col-span-2 col-start-3 row-start-2 flex flex-col">
            <LabeledText
              label="Vin Number"
              value={selectedTask?.vehicle?.vin || "N/A"}
            />
          </div>
          <div className="col-span-3 col-start-5 row-start-2 flex flex-col">
            <LabeledText
              label="Location"
              value={selectedTask?.vehicle?.garage?.name}
            />
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-blue-600 rounded" />
          <h3 className="font-medium">Request Details</h3>
        </div>
        <div className="grid grid-cols-3 gap-7">
          <div className="col-span-1">
            <Label className="text-xs text-muted-foreground">
              Request Type
            </Label>
            <Input
              className="h-8 disabled:bg-[#f6f7fb] text-xs text-left p-2 file:text-xs"
              type="text"
              readOnly
              disabled
              value={selectedTask?.typeName}
            />
          </div>
          <div className="col-span-1">
            <Label className="text-xs text-muted-foreground">Service</Label>
            <Input
              className="h-8 disabled:bg-[#f6f7fb] text-xs text-left p-2 file:text-xs"
              type="text"
              readOnly
              disabled
              value={(selectedTask?.maintenance as any)?.service_detail}
            />
          </div>
          <div className="col-span-1">
            <Label className="text-xs text-muted-foreground">Request By</Label>
            <Input
              className="h-8 disabled:bg-[#f6f7fb] text-xs text-left p-2 file:text-xs"
              type="text"
              readOnly
              disabled
              value={selectedTask?.requestBy}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 grid-rows-2 gap-x-7">
          <div className="col-span-1">
            <Label className="text-xs text-muted-foreground">Body Shop</Label>
            <Input
              className="h-8 disabled:bg-[#f6f7fb] text-xs text-left p-2 file:text-xs"
              type="text"
              readOnly
              disabled
              value={(selectedTask?.maintenance as any)?.work_shop}
            />
          </div>
          <div className="col-span-1">
            <Label className="text-xs text-muted-foreground">
              Drop Off Location
            </Label>
            <Input
              className="h-8 disabled:bg-[#f6f7fb] text-xs text-left p-2 file:text-xs"
              type="text"
              name="scheduleLocation"
              value={formState.scheduleLocation}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div className="col-span-1 row-span-2">
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Textarea
              className="text-xs text-left p-2 h-20"
              name="notes"
              value={formState.notes}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div className="col-start-1 row-start-2">
            <Label className="text-xs text-muted-foreground">
              Contact Name
            </Label>
            <Input
              className="h-8 disabled:bg-[#f6f7fb] text-xs text-left p-2 file:text-xs"
              type="text"
              readOnly
              disabled
              value="Gabriela"
            />
          </div>
          <div className="col-start-2 row-start-2">
            <Label className="text-xs text-muted-foreground">
              Contact Phone Number
            </Label>
            <Input
              className="h-8 disabled:bg-[#f6f7fb] text-xs text-left p-2 file:text-xs"
              type="text"
              readOnly
              disabled
              value="+1 647 551 3274"
            />
          </div>
        </div>
      </div>
      <br />
      <fieldset className="border border-[#0A12244D] border-dashed rounded-lg px-3 pt-2 pb-3">
        <legend className="text-xs text-gray-500 ml-3 bg-white px-2">
          Vehicle Delivery
        </legend>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <Label className="text-xs text-muted-foreground">Assign To</Label>
            <Select
              onValueChange={(value) =>
                setFormState((prev) => ({ ...prev, assigneeId: value }))
              }
              value={formState.assigneeId?.toString() || ""}
              disabled={!isEditing}
            >
              <SelectTrigger className="h-8 text-xs text-left p-2 w-full">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-1">
            <Label className="text-xs text-muted-foreground">
              Drop-off Date
            </Label>
            <Input
              className="h-8 disabled:bg-[#f6f7fb] text-xs text-left p-2 file:text-xs w-full items-center inline-grid"
              type="date"
              name="scheduleDate"
              value={
                formState.scheduleDate
                  ? new Date(formState.scheduleDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div className="col-span-1">
            <Label className="text-xs text-muted-foreground">
              Drop-off Time
            </Label>
            <Input
              className="h-8 disabled:bg-[#f6f7fb] text-xs text-left p-2 file:text-xs w-full items-center inline-grid"
              type="time"
              name="scheduleTime"
              value={
                formState.scheduleTime
                  ? new Date(formState.scheduleTime)
                      .toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      .slice(0, 5)
                  : ""
              }
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
        </div>
      </fieldset>
      <br />
      <Separator />
      <div className="flex justify-between mt-6">
        <div />
        <div className="flex gap-4">
          {!isEditing ? (
            <Button variant="outline" size="lg" onClick={handleEdit}>
              Edit
            </Button>
          ) : (
            <>
              <Button variant="outline" size="lg" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="lg" onClick={handleSave}>
                Save
              </Button>
            </>
          )}
          <Button variant="outline" size="lg">
            Cancel Request
          </Button>
        </div>
      </div>
    </div>
  );
};

interface LabeledTextProps {
  label: string;
  value?: string;
}

const LabeledText: React.FC<LabeledTextProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="text-black text-xs">{value || "N/A"}</span>
    </div>
  );
};

export default RequestDetailDialog;
