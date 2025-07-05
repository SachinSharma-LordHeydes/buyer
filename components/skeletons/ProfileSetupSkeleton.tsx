import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ProfileSetupSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-indigo-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-80 mx-auto" />
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>

        <div className="flex justify-between mb-8 overflow-x-auto gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center space-y-2 min-w-0 px-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="text-center">
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-2 w-20 hidden sm:block" />
              </div>
            </div>
          ))}
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
            <Skeleton className="h-6 w-32 bg-emerald-300" />
            <Skeleton className="h-4 w-48 bg-emerald-200" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-48 mx-auto mb-2" />
                <Skeleton className="h-4 w-64 mx-auto" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="flex justify-end pt-6">
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
