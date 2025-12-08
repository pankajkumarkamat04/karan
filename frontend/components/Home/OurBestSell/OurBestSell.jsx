"use client"
import { useGetProductsQuery } from '@/app/store/api/services/productApi';
import Loading from '@/components/Loading/Loading';
import MainCard from '@/components/ui/MainCard/MainCard'

export default function OurBestSell() {
    const { data: products, isLoading } = useGetProductsQuery();
    const data = products?.data?.filter(item => item.category === "Permanent Fruit");


    return (
        <div id="permanent" className='max-w-[1320px] mx-auto px-4 2 mt-20'>
            <div className="mb-12 lg:flex items-center justify-between text-white">
                <h1 className="text-3xl xl:text-5xl font-medium uppercase ">
                    Our <span className="text-[#FADA1B]">best sellers</span>
                </h1>
            </div>
            {
                isLoading ? <Loading /> :
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {
                            data?.length > 0 ? (
                                data?.slice(0, 20).map((item, index) => (
                                    <MainCard key={index} data={item} />
                                ))
                            ) : (
                                <div className="flex justify-center items-center h-96 w-full col-span-full">
                                    <h2 className="text-2xl font-semibold text-white text-center">No data found</h2>
                                </div>
                            )
                        }
                    </div>
            }
        </div>
    )
}
