import { useMemo, useState } from "react";

// 🔥 SWIPER
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";

const FALLBACK_IMAGE = "https://via.placeholder.com/1000x700?text=Sin+imagen";

function PropertyGallery({ images = [] }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const safeImages = useMemo(() => {
    if (!Array.isArray(images)) return [];

    return images
      .filter((img) => img && typeof img === "object")
      .map((img, index) => ({
        id: img.id ?? `image-${index}`,
        image: img.image || FALLBACK_IMAGE,
      }));
  }, [images]);

  const hasImages = safeImages.length > 0;
  const hasMultipleImages = safeImages.length > 1;

  return (
    <div className="flex justify-center mb-10">
      <div className="w-full max-w-[820px]">
        {hasImages ? (
          <>
            <Swiper
              modules={[Navigation, Thumbs]}
              navigation={hasMultipleImages}
              centeredSlides={false}
              slidesPerView={1}
              spaceBetween={12}
              loop={hasMultipleImages}
              thumbs={{
                swiper:
                  thumbsSwiper && !thumbsSwiper.destroyed
                    ? thumbsSwiper
                    : null,
              }}
              className="rounded-2xl"
            >
              {safeImages.map((img) => (
                <SwiperSlide key={img.id}>
                  <div className="overflow-hidden rounded-2xl shadow-lg border border-gray-200 bg-[#f3f2ee]">
                    <div className="flex items-center justify-center w-full h-[300px] sm:h-[380px] md:h-[500px]">
                      <img
                        src={img.image}
                        alt="Imagen de la propiedad"
                        className="block w-full h-full object-contain"
                        draggable="false"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {hasMultipleImages && (
              <div className="mt-4">
                <Swiper
                  modules={[Thumbs]}
                  onSwiper={setThumbsSwiper}
                  spaceBetween={10}
                  slidesPerView={4}
                  breakpoints={{
                    640: { slidesPerView: 5 },
                    768: { slidesPerView: 6 },
                  }}
                  watchSlidesProgress
                  className="thumbs-swiper"
                >
                  {safeImages.map((img) => (
                    <SwiperSlide key={`thumb-${img.id}`}>
                      <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#f3f2ee] shadow-sm">
                        <div className="flex items-center justify-center w-full h-20 sm:h-24">
                          <img
                            src={img.image}
                            alt="Miniatura"
                            className="block w-full h-full object-contain cursor-pointer opacity-80 hover:opacity-100 transition"
                            draggable="false"
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_IMAGE;
                            }}
                          />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border p-8 text-center text-gray-500">
            Esta propiedad aún no tiene imágenes.
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyGallery;