"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Filter, MoreHorizontal, Edit, Eye, Trash2, Package, AlertTriangle, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import gql from "graphql-tag"
import { useQuery, useMutation } from "@apollo/client"
import { toast } from "sonner"
import { ProductsSkeleton } from "@/components/skeletons/ProductsSkeleton"
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal"

// GraphQL Query to fetch seller's products
const GET_SELLER_PRODUCTS = gql`
  query GetSellerProducts($filter: ProductFilterInput, $limit: Int, $offset: Int) {
    products(filter: $filter, limit: $limit, offset: $offset) {
      id
      name
      description
      price
      sku
      stock
      status
      images {
        id
        url
        altText
        isPrimary
      }
      createdAt
      updatedAt
    }
  }
`;

// Delete Product Mutation
const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      success
      message
    }
  }
`;



export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<{id: string, name: string} | null>(null)
  
  // Fetch products with GraphQL
  const { data, loading, error, refetch } = useQuery(GET_SELLER_PRODUCTS, {
    variables: {
      filter: {
        search: searchTerm || undefined,
        status: activeTab === "all" ? undefined : activeTab.toUpperCase()
      },
      limit: 100,
      offset: 0
    },
    errorPolicy: 'all'
  });

  console.log("data", data);

  // Delete product mutation
  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    onCompleted: (data) => {
      if (data?.deleteProduct?.success) {
        toast.success("Product deleted successfully!", {
          description: "The product has been removed from your store."
        });
        refetch(); // Refresh the list after deletion
      } else {
        toast.error("Failed to delete product", {
          description: data?.deleteProduct?.message || "Unknown error occurred"
        });
      }
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error("Failed to delete product", {
        description: error.message
      });
    }
  });

  const products = data?.products || [];
  
  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))

    if (activeTab === "all") return matchesSearch
    if (activeTab === "approved") return matchesSearch && product.status === "APPROVED"
    if (activeTab === "pending") return matchesSearch && product.status === "PENDING"
    if (activeTab === "rejected") return matchesSearch && product.status === "REJECTED"
    if (activeTab === "out_of_stock") return matchesSearch && product.stock === 0

    return matchesSearch
  })

  const handleDeleteProduct = async (productId: string, productName: string) => {
    setProductToDelete({ id: productId, name: productName });
    setShowDeleteModal(true);
  }

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProduct({ variables: { id: productToDelete.id } });
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case "SUSPENDED":
        return <Badge className="bg-gray-100 text-gray-800">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  }

  const getProductImage = (product: any) => {
    const primaryImage = product.images?.find((img: any) => img.isPrimary)
    return primaryImage?.url || product.images?.[0]?.url || null
  }


  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: "text-red-600", icon: AlertTriangle }
    if (stock < 10) return { color: "text-yellow-600", icon: AlertTriangle }
    return { color: "text-green-600", icon: Package }
  }

  // Loading state
  if (loading) {
    return <ProductsSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Products</h3>
              <p>{error.message}</p>
              <Button onClick={() => refetch()} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <Button asChild>
          <Link href="/products/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((p: any) => p.status === "APPROVED").length}</div>
            <p className="text-xs text-muted-foreground">Currently approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((p: any) => p.stock < 10 && p.stock > 0).length}</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((p: any) => p.stock === 0).length}</div>
            <p className="text-xs text-muted-foreground">Unavailable</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>Manage your product catalog and inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Products</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="out_of_stock">Out of Stock</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <h3 className="text-lg font-semibold mb-2">No products found</h3>
                          <p className="text-gray-500 mb-4">
                            {searchTerm ? `No products match "${searchTerm}"` : "You haven't added any products yet."}
                          </p>
                          {!searchTerm && (
                            <Button asChild>
                              <Link href="/products/add">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Product
                              </Link>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product: any) => {
                        const stockStatus = getStockStatus(product.stock)
                        const StockIcon = stockStatus.icon
                        const productImage = getProductImage(product)

                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="relative h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                                {productImage ? (
                                  <Image
                                    src={productImage}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <Package className="h-5 w-5 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-medium">{product.name}</div>
                                {product.description && (
                                  <div className="text-sm text-gray-500 truncate max-w-[200px]">
                                    {product.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{product.sku || "N/A"}</TableCell>
                            <TableCell>{formatPrice(product.price)}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <StockIcon className={`h-4 w-4 ${stockStatus.color}`} />
                                <span className={stockStatus.color}>{product.stock}</span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(product.status)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/products/${product.id}`}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/products/${product.id}/edit`}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDeleteProduct(product.id, product.name)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={(open) => {
          setShowDeleteModal(open);
          if (!open) setProductToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete"
        itemName={productToDelete ? `"${productToDelete.name}"` : undefined}
      />
    </div>
  )
}
