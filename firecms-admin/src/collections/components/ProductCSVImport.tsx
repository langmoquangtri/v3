import React, { useState, useEffect } from "react";
import { 
  CollectionActionsProps, 
  EntityReference, 
  useDataSource 
} from "@firecms/core";
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Typography,
  CircularProgress
} from "@firecms/ui";

// Vietnamese slug generator
function generateSlug(str: string): string {
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/[^a-z0-9 -]/g, ""); // remove invalid chars
  str = str.replace(/\s+/g, "-"); // collapse whitespace and replace by -
  str = str.replace(/-+/g, "-"); // collapse dashes
  str = str.trim();
  return str;
}

// Robust CSV parser to handle quotes and embedded commas correctly
function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [""];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        row[row.length - 1] += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push("");
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += char;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  return lines;
}

export function ProductCSVImport({ collection, path }: CollectionActionsProps) {
  const dataSource = useDataSource();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [parsedProducts, setParsedProducts] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);

  // Fetch categories for mapping references and displaying a helpful guide
  useEffect(() => {
    if (open) {
      setLoadingCategories(true);
      dataSource.fetchCollection<any>({ path: "categories" })
        .then((entities: any[]) => {
          const list = entities.map((e: any) => ({
            id: e.id,
            name: e.values.name || "Danh mục không tên"
          }));
          setCategories(list);
        })
        .catch((err: any) => {
          console.error("Lỗi khi tải danh mục:", err);
        })
        .finally(() => {
          setLoadingCategories(false);
        });
    }
  }, [open, dataSource]);

  // Handle file selection and parsing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setSuccessCount(0);
    setParsedProducts([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCSV(text);
        if (rows.length < 2) {
          setErrorMessage("File CSV không hợp lệ hoặc rỗng.");
          return;
        }

        const headers = rows[0].map(h => h.trim().toLowerCase());
        
        // Match headers to find indexes
        const idxName = headers.findIndex(h => h.includes("tên sản phẩm") || h === "name");
        const idxSlug = headers.findIndex(h => h.includes("slug"));
        const idxSku = headers.findIndex(h => h.includes("mã sản phẩm") || h === "sku");
        const idxCategory = headers.findIndex(h => h.includes("mã danh mục") || h === "category_id" || h === "category");
        const idxMaterial = headers.findIndex(h => h.includes("chất liệu đá") || h === "material");
        const idxDimensions = headers.findIndex(h => h.includes("kích thước") || h === "dimensions");
        const idxShortDesc = headers.findIndex(h => h.includes("mô tả ngắn") || h === "short_description");
        const idxContent = headers.findIndex(h => h.includes("nội dung chi tiết") || h === "content");
        const idxPrice = headers.findIndex(h => h.includes("giá tham khảo") || h === "reference_price" || h === "price");
        const idxSortOrder = headers.findIndex(h => h.includes("thứ tự") || h === "sort_order");
        const idxFeatured = headers.findIndex(h => h.includes("nổi bật") || h === "featured");
        const idxStatus = headers.findIndex(h => h.includes("trạng thái") || h === "status");
        const idxSeoTitle = headers.findIndex(h => h.includes("seo title") || h === "seo_title");
        const idxSeoDesc = headers.findIndex(h => h.includes("seo description") || h === "seo_description");
        const idxMainImage = headers.findIndex(h => h.includes("ảnh đại diện") || h === "main_image");
        const idxImages = headers.findIndex(h => h.includes("thư viện ảnh") || h === "images");
        const idxFeatures = headers.findIndex(h => h.includes("đặc điểm nổi trội") || h === "features");
        const idxCommitments = headers.findIndex(h => h.includes("cam kết") || h === "commitments");
        const idxFengshuiTip = headers.findIndex(h => h.includes("mách nhỏ phong thủy") || h === "fengshui_tip");

        if (idxName === -1) {
          setErrorMessage("Không tìm thấy cột 'Tên sản phẩm' (hoặc 'name') trong file CSV.");
          return;
        }

        const productsToImport: any[] = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length < 1 || !row[idxName]) continue; // Skip empty rows

          const name = row[idxName].trim();
          const rawSlug = idxSlug !== -1 && row[idxSlug] ? row[idxSlug].trim() : "";
          const slug = rawSlug || generateSlug(name);
          const sku = idxSku !== -1 && row[idxSku] ? row[idxSku].trim() : "";
          
          let category: EntityReference | undefined = undefined;
          if (idxCategory !== -1 && row[idxCategory]) {
            const catId = row[idxCategory].trim();
            if (catId) {
              category = new EntityReference(catId, "categories");
            }
          }

          const material = idxMaterial !== -1 && row[idxMaterial] ? row[idxMaterial].trim() : "";
          const dimensions = idxDimensions !== -1 && row[idxDimensions] ? row[idxDimensions].trim() : "";
          const short_description = idxShortDesc !== -1 && row[idxShortDesc] ? row[idxShortDesc].trim() : "";
          const content = idxContent !== -1 && row[idxContent] ? row[idxContent].trim() : "";
          
          let reference_price: number | undefined = undefined;
          if (idxPrice !== -1 && row[idxPrice]) {
            const p = parseFloat(row[idxPrice].replace(/[^\d.]/g, ""));
            if (!isNaN(p)) {
              reference_price = p;
            }
          }

          let sort_order = 0;
          if (idxSortOrder !== -1 && row[idxSortOrder]) {
            const s = parseInt(row[idxSortOrder].trim(), 10);
            if (!isNaN(s)) {
              sort_order = s;
            }
          }

          let featured = false;
          if (idxFeatured !== -1 && row[idxFeatured]) {
            const f = row[idxFeatured].trim().toLowerCase();
            featured = f === "true" || f === "yes" || f === "1" || f === "bật" || f === "co";
          }

          let status: "draft" | "published" | "hidden" = "draft";
          if (idxStatus !== -1 && row[idxStatus]) {
            const st = row[idxStatus].trim().toLowerCase();
            if (st === "published" || st === "đã xuất bản" || st === "hiện") {
              status = "published";
            } else if (st === "hidden" || st === "đã ẩn" || st === "ẩn") {
              status = "hidden";
            }
          }

          const seo_title = idxSeoTitle !== -1 && row[idxSeoTitle] ? row[idxSeoTitle].trim() : "";
          const seo_description = idxSeoDesc !== -1 && row[idxSeoDesc] ? row[idxSeoDesc].trim() : "";
          const main_image = idxMainImage !== -1 && row[idxMainImage] ? row[idxMainImage].trim() : "";
          
          let images: string[] = [];
          if (idxImages !== -1 && row[idxImages]) {
            images = row[idxImages]
              .split(/[;|\n]/)
              .map(img => img.trim())
              .filter(img => img.length > 0);
          }

          let features: string[] = [];
          if (idxFeatures !== -1 && row[idxFeatures]) {
            features = row[idxFeatures]
              .split(/[;|\n]/)
              .map(f => f.trim())
              .filter(f => f.length > 0);
          }

          let commitments: string[] = [];
          if (idxCommitments !== -1 && row[idxCommitments]) {
            commitments = row[idxCommitments]
              .split(/[;|\n]/)
              .map(c => c.trim())
              .filter(c => c.length > 0);
          }

          const fengshui_tip = idxFengshuiTip !== -1 && row[idxFengshuiTip] ? row[idxFengshuiTip].trim() : "";

          productsToImport.push({
            name,
            slug,
            sku,
            category,
            material,
            dimensions,
            short_description,
            content,
            reference_price,
            sort_order,
            featured,
            status,
            seo_title,
            seo_description,
            main_image,
            images,
            features,
            commitments,
            fengshui_tip,
          });
        }

        if (productsToImport.length === 0) {
          setErrorMessage("Không tìm thấy sản phẩm hợp lệ nào trong file CSV.");
        } else {
          setParsedProducts(productsToImport);
          setTotalItems(productsToImport.length);
        }
      } catch (err: any) {
        console.error(err);
        setErrorMessage("Lỗi khi đọc file: " + err.message);
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  // Perform bulk import
  const handleImport = async () => {
    if (parsedProducts.length === 0) return;

    setImporting(true);
    setProgress(0);
    let success = 0;

    for (let i = 0; i < parsedProducts.length; i++) {
      const prod = parsedProducts[i];
      try {
        await dataSource.saveEntity({
          path: path,
          entityId: prod.slug, // Use slug as document ID to ensure uniqueness and clean URLs
          values: {
            ...prod,
            created_at: new Date(),
            updated_at: new Date(),
          },
          collection: collection,
          status: "new",
        });
        success++;
        setSuccessCount(success);
      } catch (err) {
        console.error("Lỗi khi nhập sản phẩm:", prod.name, err);
      }
      setProgress(Math.round(((i + 1) / parsedProducts.length) * 100));
    }

    setImporting(false);
    setParsedProducts([]);
  };

  // Generate a sample CSV template for download
  const handleDownloadTemplate = () => {
    const csvContent = "Tên sản phẩm,Slug,Mã sản phẩm,Mã danh mục,Chất liệu đá,Kích thước,Mô tả ngắn,Nội dung chi tiết,Giá tham khảo,Thứ tự hiển thị,Sản phẩm nổi bật,Trạng thái,SEO Title,SEO Description,Ảnh đại diện,Thư viện ảnh,Đặc điểm nổi trội,Cam kết,Mách nhỏ phong thủy\n" +
      "Lăng mộ đá xanh Thanh Hóa,lang-mo-da-xanh-thanh-hoa,LM001,lang-mo-da,Đá xanh Thanh Hóa,81 x 127 cm,Thiết kế cổ kính tinh xảo,Mô tả chi tiết về sản phẩm bằng Markdown...,15000000,1,true,published,Lăng mộ đá xanh Thanh Hóa cao cấp,Chuyên sản xuất lăng mộ đá xanh mạ vàng 24K,https://images.langmodaquangtri.com/products/main/avatar.jpg,https://images.langmodaquangtri.com/products/gallery/img1.jpg;https://images.langmodaquangtri.com/products/gallery/img2.jpg,Bề mặt phẳng tuyệt đối;Độ cứng cao;Không nứt nẻ;Bảo hành 15 năm,Khắc chân dung truyền thần kỹ nghệ Laser siêu nét;Đá chất lượng cao;Thi công đúng tiến độ,Theo chuẩn thước lỗ ban mang lại may mắn phú quý.\n" +
      "Mộ đá tròn mạ vàng,,MD002,mo-da-tron,Đá xanh nguyên khối,Đường kính 127 cm,Mộ tròn mạ vàng phong thủy,Mô tả chi tiết tại đây...,25000000,2,false,draft,Mộ đá tròn mạ vàng phong thủy,Sản xuất mộ tròn mạ vàng đẹp Ninh Vân,https://images.langmodaquangtri.com/products/main/avatar2.jpg,,,";

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "mau_import_san_pham.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => setOpen(true)}
        className="ml-2"
        style={{ marginRight: 8 }}
      >
        <svg 
          className="w-4 h-4 mr-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" 
          />
        </svg>
        Nhập CSV
      </Button>

      <Dialog open={open} onOpenChange={(v) => !importing && setOpen(v)} maxWidth="3xl">
        <DialogTitle>Nhập sản phẩm hàng loạt (file CSV)</DialogTitle>
        <DialogContent>
          <div className="space-y-4 py-2" style={{ fontFamily: "sans-serif" }}>
            <Typography variant="body2" className="text-stone-600">
              Nhập hàng loạt sản phẩm từ file CSV để tiết kiệm thời gian. Tên các cột trong file CSV có thể là tiếng Việt hoặc tiếng Anh.
            </Typography>

            <div className="flex gap-4 items-center">
              <Button onClick={handleDownloadTemplate} variant="outlined" size="small">
                📥 Tải File CSV Mẫu
              </Button>
            </div>

            {/* List of categories helper */}
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <Typography variant="subtitle2" className="font-bold mb-1">
                📌 Danh sách danh mục hiện có (Dùng cho cột &quot;Mã danh mục&quot;):
              </Typography>
              {loadingCategories ? (
                <div className="flex items-center gap-2 py-1 text-stone-500 text-xs">
                  <CircularProgress size="small" /> Đang tải danh sách danh mục...
                </div>
              ) : categories.length === 0 ? (
                <span className="text-stone-500 text-xs">Chưa có danh mục nào. Hãy tạo danh mục trước.</span>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="text-xs bg-white border px-2 py-1 rounded">
                      <strong className="text-stone-700">{cat.name}:</strong>{" "}
                      <code className="text-rose-600 font-mono select-all bg-stone-100 px-1 rounded">{cat.id}</code>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* File Upload Zone */}
            {!importing && (
              <div className="border-2 border-dashed border-stone-300 hover:border-blue-500 rounded-lg p-6 text-center cursor-pointer relative bg-stone-50 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <svg
                  className="w-10 h-10 mx-auto text-stone-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
                <Typography variant="body1" className="font-semibold text-stone-700">
                  Kéo thả file CSV vào đây hoặc bấm để chọn file
                </Typography>
                <Typography variant="caption" className="text-stone-500 block mt-1">
                  Chấp nhận định dạng .csv mã hóa UTF-8
                </Typography>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                ❌ {errorMessage}
              </div>
            )}

            {/* Parsing / Uploading Status */}
            {importing && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded text-center">
                <CircularProgress size="medium" className="mx-auto mb-2" />
                <Typography variant="body2" className="font-bold text-blue-800">
                  Đang tiến hành nhập dữ liệu: {successCount} / {totalItems} sản phẩm...
                </Typography>
                <div className="w-full bg-slate-200 h-2.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success Status */}
            {successCount > 0 && !importing && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm font-semibold">
                🎉 Nhập thành công {successCount} / {totalItems} sản phẩm vào cơ sở dữ liệu!
              </div>
            )}

            {/* CSV Products Preview */}
            {parsedProducts.length > 0 && !importing && (
              <div className="border rounded max-h-60 overflow-y-auto">
                <table className="w-full text-xs text-left text-stone-600">
                  <thead className="bg-stone-100 text-stone-700 uppercase font-bold sticky top-0 border-b">
                    <tr>
                      <th className="px-3 py-2">Tên sản phẩm</th>
                      <th className="px-3 py-2">Slug</th>
                      <th className="px-3 py-2">Kích thước</th>
                      <th className="px-3 py-2">Mã DM</th>
                      <th className="px-3 py-2">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedProducts.map((p, idx) => (
                      <tr key={idx} className="border-b hover:bg-stone-50">
                        <td className="px-3 py-2 font-medium text-stone-900">{p.name}</td>
                        <td className="px-3 py-2 font-mono">{p.slug}</td>
                        <td className="px-3 py-2">{p.dimensions || "-"}</td>
                        <td className="px-3 py-2 font-mono">{p.category?.id || "-"}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            p.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={importing} color="text">
            Đóng
          </Button>
          <Button
            onClick={handleImport}
            disabled={parsedProducts.length === 0 || importing}
            variant="filled"
            color="primary"
          >
            Bắt đầu Nhập ({parsedProducts.length})
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
