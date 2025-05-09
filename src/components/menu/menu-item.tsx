"use client";

import React, { useState } from "react";
import Image from "next/image";

interface MenuItemProps {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

const fallbackImage = "/dineva.png";

const MenuItemCard: React.FC<MenuItemProps> = ({
  name,
  description,
  price,
  image,
}) => {
  const [imgError, setImgError] = useState(false);

  const imageToUse = !imgError && image?.trim() !== "" ? image : fallbackImage;

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col">
      <div className="relative w-full aspect-square overflow-hidden mb-4 rounded-lg">
        <Image
          src={imageToUse}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 ease-in-out hover:scale-105"
          onError={() => setImgError(true)}
          placeholder="blur"
          blurDataURL="/dineva-blur.jpg"
        />
      </div>

      <h2 className="text-2xl font-semibold mb-2 break-words">{name}</h2>
      <p className="text-gray-600 mb-4 break-words">{description}</p>
      <div className="mt-auto">
        <p className="text-lg font-bold">{price} грн</p>
      </div>
    </div>
  );
};

export default MenuItemCard;
