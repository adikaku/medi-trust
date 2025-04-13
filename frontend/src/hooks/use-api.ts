import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

// Types
export type Medicine = {
  id: string;
  name: string;
  sub_category: string;
  salt_composition: string;
  medicine_desc: string;
  side_effects: string;
  price: number;
  manufacturer_name: string;
  pack_size_label: string;
  generic_name: string;
  unit_size: string;
  mrp: number;
  
};



export type Pharmacy = {
  id: string;
  name: string;
  address: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
  };
};

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
};

export type DiaryEntry = {
  id: string;
  medicineId: string;
  medicineName: string;
  date: string;
  tags: string[];
  notes?: string;
};

// Hooks
export const useMedicines = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/medicine/all");
        const data = await response.json();
        setMedicines(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch medicines");
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  return { medicines, loading, error };
};

export const useMedicineByName = (name: string | null) => {
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedicine = async () => {
      if (!name) {
        setMedicine(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/api/medicine/search?name=${encodeURIComponent(name)}`);
        const data = await response.json();

        // Normalize keys coming from MongoDB
        const normalized: Medicine = {
        id: data._id || data.id,
        name: data.name || "Unknown Medicine",
        sub_category: data.sub_category || "Uncategorized",
        salt_composition: data.salt_composition || "Not available",
        medicine_desc: data.medicine_desc || data.description || "No description available",
        side_effects: data.side_effects || "No side effects info",
        price: data["price(₹)"] || data.price || 0,
        pack_size_label: data.pack_size_label || data.pack_size || "N/A",
        manufacturer_name: data.manufacturer_name || data["generic_manufacturer"] || data.manufacturer || "Unknown",
        generic_name: data.generic_name || data.generic_substitute_name || "Not available",
        unit_size: data.unit_size || "N/A",
        mrp: data.mrp || data.generic_price || 0,
       };

        
        
        setMedicine(normalized);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch medicine");
        setLoading(false);
      }
    };

    fetchMedicine();
  }, [name]);

  return { medicine, loading, error };
};

export const useMedicineById = (id: string | null) => {
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedicine = async () => {
      if (!id) {
        setMedicine(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/api/medicine/${id}`);
        const data = await response.json();
        setMedicine(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch medicine");
        setLoading(false);
      }
    };

    fetchMedicine();
  }, [id]);

  return { medicine, loading, error };
};




export const useNearbyPharmacies = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/pharmacies");
        const data = await response.json();
        setPharmacies(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch pharmacies");
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

  return { pharmacies, loading, error };
};

export const useLatestNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/news");
        const data = await response.json();
        setNews(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch news");
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return { news, loading, error };
};

export const useDiaryEntries = (userId: string | null) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("👤 useDiaryEntries triggered with userId:", userId);
    const fetchEntries = async () => {
      if (!userId) {
        setEntries([]);
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        console.log("📦 Token used for /api/diary fetch:", token);
        const response = await fetch(`http://localhost:3000/api/diary`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch diary entries');
        }
        
        const data = await response.json();
        const mappedEntries: DiaryEntry[] = data.map((entry: any) => ({
          id: entry._id,
          medicineId: entry.medicine_data?._id || "",
          medicineName: entry.medicine_name,
          date: entry.created_at || "", // ✅ for formatDate to work
          tags: entry.tags || [],
          notes: entry.notes || "",
        }));

        setEntries(mappedEntries);
        
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch diary entries");
        setLoading(false);
      }
    };

    fetchEntries();
  }, [userId]);

  const addEntry = async (medicineId: string, notes?: string, tags?: string[]) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch("http://localhost:3000/api/diary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          medicineId,
          notes: notes || '',
          tags: tags || []
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add entry');
      }

      // Refetch entries to include the new one
      const updatedResponse = await fetch(`http://localhost:3000/api/diary`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const updatedData = await updatedResponse.json();
      setEntries(updatedData);
      
      return true;
    } catch (error) {
      console.error("Failed to add diary entry:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      return false;
    }
  };

  const addOcrEntry = async (medicineId: string, medicineName: string) => {
    return addEntry(medicineId); // Reuse the standard addEntry function
  };

  return { entries, loading, error, addEntry, addOcrEntry };
};
export type OCRMedicineResult = {
  name?: string;
  sub_category?: string;
  salt_composition?: string;
  description?: string; // ✅ extra
  side_effects?: string;
  price?: number;
  manufacturer?: string; // ✅ extra
  pack_size?: string; // ✅ extra
  generic_name?: string;
  unit_size?: string;
  mrp?: number;
};
// OCR Processing
export const processOCR = async (file: File): Promise<OCRMedicineResult> => {
  const formData = new FormData();
  formData.append("image", file);
  
  try {
    // Log to console that OCR processing is starting
    console.log('Starting OCR processing...');
    
    const response = await fetch("http://localhost:3000/api/medicine/ocr/upload", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errText = await response.text();
      console.error("OCR API error:", errText);
      throw new Error("OCR failed");
    }
    
    const data = await response.json();
    
    // Print OCR results to console
    console.log('OCR Results:');
    console.log(data);
    
    // Format the data for better readability in the console
    console.table(data);
    
    return data;
  } catch (err) {
    console.error("OCR fetch error:", err);
    throw err;
  }
};
// Search medicines
export const searchMedicines = async (query: string): Promise<Medicine[]> => {
  try {
    const response = await fetch(`http://localhost:3000/api/medicine/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
};
export const addOcrEntry = async ({
  medicineId,
  medicineName,
}: {
  medicineId: string;
  medicineName: string;
}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`http://localhost:3000/api/diary/ocr`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ medicineId, medicineName }),
  });
  if (!res.ok) {
    throw new Error("Failed to add OCR diary entry");
  }
  return res.json();
};