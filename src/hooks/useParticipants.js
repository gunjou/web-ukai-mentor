import { useCallback, useEffect, useState } from "react";

import {
  getMentorClasses,
  getClassParticipants,
} from "../services/participantService";

export default function useParticipants() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const [participants, setParticipants] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
  });

  const [classLoading, setClassLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  /*
   * ==========================================
   * LOAD CLASSES
   * ==========================================
   */

  const loadClasses = useCallback(async () => {
    try {
      setClassLoading(true);
      setError(null);

      const data = await getMentorClasses();

      setClasses(Array.isArray(data) ? data : []);

      /*
       * Pilih kelas pertama secara otomatis
       */

      if (Array.isArray(data) && data.length > 0) {
        setSelectedClass(data[0]);
      } else {
        setSelectedClass(null);
        setParticipants([]);
        setMeta({
          total: 0,
        });
      }
    } catch (err) {
      console.error("Gagal mengambil kelas mentor:", err);

      setError(err?.message || "Gagal memuat kelas yang diampu mentor.");

      setClasses([]);
      setSelectedClass(null);
      setParticipants([]);
      setMeta({
        total: 0,
      });
    } finally {
      setClassLoading(false);
    }
  }, []);

  /*
   * ==========================================
   * LOAD PARTICIPANTS
   * ==========================================
   */

  const loadParticipants = useCallback(async (id_paketkelas) => {
    if (!id_paketkelas) {
      setParticipants([]);
      setMeta({
        total: 0,
      });

      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getClassParticipants(id_paketkelas);

      const participantData = Array.isArray(data) ? data : [];

      setParticipants(participantData);

      setMeta({
        total: participantData.length,
      });
    } catch (err) {
      console.error("Gagal mengambil peserta:", err);

      setError(err?.message || "Gagal memuat daftar peserta.");

      setParticipants([]);

      setMeta({
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * ==========================================
   * INITIAL LOAD
   * ==========================================
   */

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  /*
   * ==========================================
   * LOAD PARTICIPANTS WHEN CLASS CHANGES
   * ==========================================
   */

  useEffect(() => {
    if (!selectedClass?.id_paketkelas) {
      setParticipants([]);
      setMeta({
        total: 0,
      });

      return;
    }

    loadParticipants(selectedClass.id_paketkelas);
  }, [selectedClass, loadParticipants]);

  /*
   * ==========================================
   * CLASS CHANGE
   * ==========================================
   */

  const handleClassChange = useCallback(
    (id) => {
      const selected = classes.find(
        (item) => String(item.id_paketkelas) === String(id)
      );

      setSelectedClass(selected || null);
    },
    [classes]
  );

  /*
   * ==========================================
   * REFRESH
   * ==========================================
   */

  const handleRefresh = useCallback(async () => {
    await loadClasses();

    /*
     * loadClasses akan memilih kelas pertama.
     * Peserta kemudian akan otomatis di-load
     * melalui effect selectedClass.
     */
  }, [loadClasses]);

  return {
    classes,
    selectedClass,

    participants,
    meta,

    classLoading,
    loading,
    error,

    handleClassChange,
    handleRefresh,
  };
}
