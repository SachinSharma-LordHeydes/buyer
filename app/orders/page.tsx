"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Filter,
  Download,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Printer,
  Mail,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDashboardStore, type Order } from "@/lib/store"
import { toast } from "sonner"

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Package className="h-4 w-4" />
    case "processing":
      return <Package className="h-4 w-4" />
    case "shipped":
      return <Truck className="h-4 w-4" />
    case "delivered":
      return <CheckCircle className="h-4 w-4" />
    case "cancelled":
    case "returned":
      return <XCircle className="h-4 w-4" />
    default:
      return <Package className="h-4 w-4" />
  }
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "pending":
      return "secondary"
    case "processing":
      return "default"
    case "shipped":
      return "outline"
    case "delivered":
      return "default"
    case "cancelled":
    case "returned":
      return "destructive"
    default:
      return "secondary"
  }
}

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case "high":
      return "destructive"
    case "normal":
      return "secondary"
    case "low":
      return "outline"
    default:
      return "secondary"
  }
}

export default function OrdersPage() {
  const {
    orders,
    selectedOrders,
    orderFilters,
    updateOrderStatus,
    bulkUpdateOrders,
    selectOrder,
    selectAllOrders,
    clearSelectedOrders,
    setOrderFilters,
  } = useDashboardStore()

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(orderFilters.search.toLowerCase()) ||
      order.id.toLowerCase().includes(orderFilters.search.toLowerCase())
    const matchesStatus = orderFilters.status === "all" || order.status === orderFilters.status
    const matchesPriority = orderFilters.priority === "all" || order.priority === orderFilters.priority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleBulkAction = (action: string) => {
    if (selectedOrders.length === 0) {
      toast.error("Please select orders first")
      return
    }

    switch (action) {
      case "mark_processing":
        bulkUpdateOrders(selectedOrders, "processing")
        toast.success(`${selectedOrders.length} orders marked as processing`)
        break
      case "mark_shipped":
        bulkUpdateOrders(selectedOrders, "shipped")
        toast.success(`${selectedOrders.length} orders marked as shipped`)
        break
      case "print_labels":
        toast.success(`Printing labels for ${selectedOrders.length} orders`)
        break
      case "export":
        toast.success(`Exporting ${selectedOrders.length} orders`)
        break
      default:
        break
    }
  }

  const handleStatusUpdate = (orderId: string, newStatus: Order["status"]) => {
    updateOrderStatus(orderId, newStatus)
    toast.success(`Order ${orderId} updated to ${newStatus}`)
  }

  const getOrdersByStatus = (status: string) => {
    return filteredOrders.filter((order) => order.status === status)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Exporting orders...")}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-8"
            value={orderFilters.search}
            onChange={(e) => setOrderFilters({ search: e.target.value })}
          />
        </div>
        <Select value={orderFilters.status} onValueChange={(value) => setOrderFilters({ status: value })}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
        <Select value={orderFilters.priority} onValueChange={(value) => setOrderFilters({ priority: value })}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedOrders.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{selectedOrders.length} order(s) selected</span>
              <div className="flex items-center space-x-2">
                <Button size="sm" onClick={() => handleBulkAction("mark_processing")}>
                  Mark as Processing
                </Button>
                <Button size="sm" onClick={() => handleBulkAction("mark_shipped")}>
                  Mark as Shipped
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("print_labels")}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Labels
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("export")}>
                  Export Selected
                </Button>
                <Button size="sm" variant="outline" onClick={clearSelectedOrders}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Orders ({filteredOrders.length})</TabsTrigger>
          <TabsTrigger value="new">New Orders ({getOrdersByStatus("pending").length})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({getOrdersByStatus("processing").length})</TabsTrigger>
          <TabsTrigger value="shipped">Shipped ({getOrdersByStatus("shipped").length})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({getOrdersByStatus("delivered").length})</TabsTrigger>
          <TabsTrigger value="returns">Returns ({getOrdersByStatus("returned").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>Manage and track all your orders in one place.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                        onCheckedChange={selectAllOrders}
                      />
                    </TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={() => selectOrder(order.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer}</div>
                          <div className="text-sm text-muted-foreground">{order.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status)} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(order.status)}
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityVariant(order.priority)}>{order.priority}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{order.total}</TableCell>
                      <TableCell>{order.items}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Order Details - {order.id}</DialogTitle>
                                <DialogDescription>Complete order information and management options</DialogDescription>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-medium mb-2">Customer Information</h4>
                                        <div className="space-y-1">
                                          <p className="text-sm">{selectedOrder.customer}</p>
                                          <p className="text-sm text-muted-foreground">{selectedOrder.email}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-2">Order Status</h4>
                                        <Badge variant={getStatusVariant(selectedOrder.status)}>
                                          {selectedOrder.status}
                                        </Badge>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-2">Priority</h4>
                                        <Badge variant={getPriorityVariant(selectedOrder.priority)}>
                                          {selectedOrder.priority}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-medium mb-2">Shipping Address</h4>
                                        <p className="text-sm text-muted-foreground">{selectedOrder.shippingAddress}</p>
                                      </div>
                                      {selectedOrder.trackingNumber && (
                                        <div>
                                          <h4 className="font-medium mb-2">Tracking Number</h4>
                                          <p className="text-sm font-mono bg-muted p-2 rounded">
                                            {selectedOrder.trackingNumber}
                                          </p>
                                        </div>
                                      )}
                                      <div>
                                        <h4 className="font-medium mb-2">Order Total</h4>
                                        <p className="text-lg font-semibold">{selectedOrder.total}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-3">Order Items</h4>
                                    <div className="border rounded-lg">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Price</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {selectedOrder.products.map((product, index) => (
                                            <TableRow key={index}>
                                              <TableCell className="font-medium">{product.name}</TableCell>
                                              <TableCell>{product.quantity}</TableCell>
                                              <TableCell>{product.price}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    {selectedOrder.status === "pending" && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleStatusUpdate(selectedOrder.id, "processing")}
                                      >
                                        Start Processing
                                      </Button>
                                    )}
                                    {selectedOrder.status === "processing" && (
                                      <Button size="sm" onClick={() => handleStatusUpdate(selectedOrder.id, "shipped")}>
                                        Mark as Shipped
                                      </Button>
                                    )}
                                    {selectedOrder.status === "shipped" && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleStatusUpdate(selectedOrder.id, "delivered")}
                                      >
                                        Mark as Delivered
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => toast.success("Printing shipping label...")}
                                    >
                                      <Printer className="mr-2 h-4 w-4" />
                                      Print Label
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => toast.success("Opening email client...")}
                                    >
                                      <Mail className="mr-2 h-4 w-4" />
                                      Contact Customer
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => toast.success("Printing invoice...")}
                                    >
                                      Print Invoice
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {order.status === "pending" && (
                                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "processing")}>
                                  Start Processing
                                </DropdownMenuItem>
                              )}
                              {order.status === "processing" && (
                                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "shipped")}>
                                  Mark as Shipped
                                </DropdownMenuItem>
                              )}
                              {order.status === "shipped" && (
                                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "delivered")}>
                                  Mark as Delivered
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => toast.success("Printing invoice...")}>
                                Print Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.success("Printing shipping label...")}>
                                Print Shipping Label
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.success("Opening email client...")}>
                                Contact Customer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual status tabs */}
        {["new", "processing", "shipped", "delivered", "returns"].map((tabValue) => {
          const statusMap = {
            new: "pending",
            processing: "processing",
            shipped: "shipped",
            delivered: "delivered",
            returns: "returned",
          }
          const status = statusMap[tabValue as keyof typeof statusMap]
          const statusOrders = getOrdersByStatus(status)

          return (
            <TabsContent key={tabValue} value={tabValue} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {tabValue === "new"
                      ? "New Orders"
                      : tabValue === "returns"
                        ? "Returns & Refunds"
                        : `${tabValue.charAt(0).toUpperCase() + tabValue.slice(1)} Orders`}
                  </CardTitle>
                  <CardDescription>
                    {tabValue === "new"
                      ? "Orders that require immediate attention."
                      : tabValue === "processing"
                        ? "Orders currently being prepared for shipment."
                        : tabValue === "shipped"
                          ? "Orders that have been shipped and are in transit."
                          : tabValue === "delivered"
                            ? "Orders that have been successfully delivered."
                            : "Manage return requests and refund processing."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {statusOrders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Date</TableHead>
                          {tabValue === "shipped" && <TableHead>Tracking</TableHead>}
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {statusOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>{order.customer}</TableCell>
                            <TableCell>{order.total}</TableCell>
                            <TableCell>{order.date}</TableCell>
                            {tabValue === "shipped" && (
                              <TableCell>
                                {order.trackingNumber ? (
                                  <Button variant="link" size="sm" className="p-0 h-auto">
                                    {order.trackingNumber}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusUpdate(order.id, "shipped")}
                                  >
                                    Generate Tracking
                                  </Button>
                                )}
                              </TableCell>
                            )}
                            <TableCell>
                              {tabValue === "new" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(order.id, "processing")}
                                >
                                  Start Processing
                                </Button>
                              )}
                              {tabValue === "processing" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(order.id, "shipped")}
                                >
                                  Mark as Shipped
                                </Button>
                              )}
                              {tabValue === "shipped" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(order.id, "delivered")}
                                >
                                  Mark as Delivered
                                </Button>
                              )}
                              {tabValue === "delivered" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toast.success("Feedback request sent!")}
                                >
                                  Request Feedback
                                </Button>
                              )}
                              {tabValue === "returns" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toast.success("Processing return...")}
                                >
                                  Process Return
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      {getStatusIcon(status)}
                      <h3 className="mt-4 text-lg font-semibold">No {tabValue === "new" ? "new" : tabValue} orders</h3>
                      <p className="text-muted-foreground">
                        {tabValue === "new"
                          ? "New orders will appear here when received."
                          : tabValue === "returns"
                            ? "Return requests will appear here."
                            : `${tabValue.charAt(0).toUpperCase() + tabValue.slice(1)} orders will appear here.`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
