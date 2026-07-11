'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import Product from '../Product/Product';
import { useModalSearchContext } from '@/context/ModalSearchContext'
import api from '@/lib/api'; 

const ModalSearch = () => {
    const { isModalOpen, closeModalSearch } = useModalSearchContext();
    const [searchKeyword, setSearchKeyword] = useState('');
    const [recentProducts, setRecentProducts] = useState([]);
    const router = useRouter()

    useEffect(() => {
        const fetchRecentProducts = async () => {
            try {
                // Yahan apna API endpoint check kar lein
                const res = await api.get('/api/v1/Products/recent'); 
                
                // --- TEST LOG ---
                console.log("Recent Products API Response:", res?.data);

                if (res?.data?.Data) {
                    setRecentProducts(res.data.Data.slice(0, 4));
                }
            } catch (err) {
                console.error('Error fetching recent products:', err);
            }
        };

        // Jab modal open ho tabhi fetch karein sdf\

        
        if (isModalOpen) {
            fetchRecentProducts();
        }
    }, [isModalOpen]);

    const handleSearch = (value: string) => {
        router.push(`/search-result?query=${value}`)
        closeModalSearch()
        setSearchKeyword('')
    }

    return (
        <>
            <div className={`modal-search-block`} onClick={closeModalSearch}>
                <div
                    className={`modal-search-main md:p-10 p-6 rounded-[32px] ${isModalOpen ? 'open' : ''}`}
                    onClick={(e) => { e.stopPropagation() }}
                >
                    <div className="form-search relative">
                        <Icon.MagnifyingGlass
                            className='absolute heading5 right-6 top-1/2 -translate-y-1/2 cursor-pointer'
                            onClick={() => handleSearch(searchKeyword)}
                        />
                        <input
                            type="text"
                            placeholder='Searching...'
                            className='text-button-lg h-14 rounded-2xl border border-line w-full pl-6 pr-12'
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchKeyword)}
                        />
                    </div>
                    
                    <div className="list-recent mt-8">
                        <div className="heading6">Recently viewed products</div>
                        <div className="list-product pb-5 hide-product-sold grid xl:grid-cols-4 sm:grid-cols-2 gap-7 mt-4">
                            {recentProducts.length > 0 ? (
                                recentProducts.map((product: any) => (
                                    <Product key={product.id} data={product} type='grid' />
                                ))
                            ) : (
                                <p className="text-secondary">No products found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ModalSearch;