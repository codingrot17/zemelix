import { Navigate, useParams } from "react-router-dom";

export default function CategoryPage() {
    const { id = "" } = useParams();
    return <Navigate to={`/collections?view=products&category=${encodeURIComponent(id)}`} replace />;
}
