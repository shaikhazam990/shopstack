import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../services/product.api";
import useDebounce from "../../../shared/hooks/useDebounce";

const useProducts = (initialFilters = {}) => {
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sort: "newest",
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    ...initialFilters,
  });

  const debouncedSearch = useDebounce(filters.search, 400);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getProducts({ ...filters, search: debouncedSearch });
      setProducts(data.data.products);
      setTotal(data.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: key !== "page" ? 1 : value }));

  return { products, total, loading, filters, updateFilter };
};

export default useProducts;