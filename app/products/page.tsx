import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Download, Eye, Edit, Plus } from "lucide-react"
import Link from "next/link"

const products = [
  {
    id: "PROD-001",
    name: "Wireless Headphones",
    sku: "WH-001",
    category: "Electronics",
    price: "$199.99",
    stock: 45,
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "PROD-002",
    name: "Smart Watch",
    sku: "SW-002",
    category: "Electronics",
    price: "$299.99",
    stock: 23,
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "PROD-003",
    name: "Laptop Stand",
    sku: "LS-003",
    category: "Accessories",
    price: "$49.99",
    stock: 0,
    status: "out_of_stock",
    image: "/placeholder.svg?height=40&width=40",
  },
]

export default function ProductsPage() {
  return (
    <div className="flex-1 space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Products</h2>
        <div className="flex items-center space-x-2">
          <Button asChild size="sm">
            <Link href="/products/add">
              <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Add Product</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-8 text-sm" />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm bg-transparent">
            <Filter className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm bg-transparent">
            <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Product Inventory</CardTitle>
          <CardDescription className="text-sm">Manage your product catalog and inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px] text-xs sm:text-sm">Product</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs sm:text-sm">SKU</TableHead>
                  <TableHead className="hidden md:table-cell text-xs sm:text-sm">Category</TableHead>
                  <TableHead className="text-xs sm:text-sm">Price</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Stock</TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="h-8 w-8 sm:h-10 sm:w-10 rounded-md object-cover"
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-xs sm:text-sm truncate">{product.name}</div>
                          <div className="text-xs text-muted-foreground sm:hidden">{product.sku}</div>
                          <div className="text-xs text-muted-foreground md:hidden">{product.category}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell font-mono text-xs sm:text-sm">{product.sku}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs sm:text-sm">{product.category}</TableCell>
                    <TableCell className="font-medium text-xs sm:text-sm">{product.price}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                      <span className={product.stock === 0 ? "text-red-600" : ""}>{product.stock}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === "active"
                            ? "default"
                            : product.status === "out_of_stock"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {product.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
