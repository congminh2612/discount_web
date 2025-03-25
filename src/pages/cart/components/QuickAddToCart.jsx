import React, { useState } from 'react';
import { Button, message, InputNumber, Modal, Space, Typography, Image, Select, Divider } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useCart } from '@/context/CartContext';

const { Text, Title } = Typography;
const { Option } = Select;

const QuickAddToCart = ({ product }) => {
  const [visible, setVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const { addItem, loading } = useCart();

  const showModal = () => {
    setVisible(true);
    setQuantity(1);
  
    if (product.has_variant && product.variants?.length === 1) {
      setSelectedVariant(product.variants[0]);
      const attrs = {};
      product.variants[0].attributes?.forEach(attr => {
        attrs[attr.attribute_name.toLowerCase()] = attr.value;
      });
      setSelectedAttributes(attrs);
    } else {
      // setSelectedVariant(null);
      setSelectedAttributes({});
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleAddToCart = async () => {
    try {
      if (product.has_variant && !selectedVariant) {
        message.error('Please select a variant option');
        return;
      }
  
      const productToAdd = {
        id: product.id,
        name: product.name,
        image_url: selectedVariant?.image_url || product.image_url,
        final_price: selectedVariant ? selectedVariant.final_price : product.final_price,
        original_price: selectedVariant ? selectedVariant.original_price : product.original_price,
        stock_quantity: selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity
      };
  
      await addItem(productToAdd, quantity, selectedVariant?.id || null);
  
      setVisible(false);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      message.error('Thêm vào giỏ hàng thất bại');
    }
  };

  const getAttributeTypes = () => {
    if (!product || !product.variants) return [];

    const types = new Set();
    product.variants.forEach((variant) => {
      variant.attributes?.forEach((attr) => {
        types.add(attr.attribute_name.toLowerCase());
      });
    });

    return Array.from(types);
  };

  const getUniqueAttributeValues = (attributeName) => {
    if (!product || !product.variants) return [];

    const values = new Set();
    product.variants.forEach((variant) => {
      const attr = variant.attributes?.find((a) => a.attribute_name.toLowerCase() === attributeName.toLowerCase());
      if (attr && attr.value) {
        values.add(attr.value);
      }
    });

    return Array.from(values);
  };

  const handleSelectAttribute = (attributeName, value) => {
    const newAttributes = {
      ...selectedAttributes,
      [attributeName.toLowerCase()]: value,
    };

    setSelectedAttributes(newAttributes);

    const matchingVariant = product.variants.find((variant) => {
      return getAttributeTypes().every((attrType) => {
        const selectedValue = newAttributes[attrType];
        if (!selectedValue) return true;

        const variantAttr = variant.attributes?.find((attr) => attr.attribute_name.toLowerCase() === attrType);
        return variantAttr && variantAttr.value === selectedValue;
      });
    });

    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
    }
  };

  const isAttributeValueAvailable = (attributeName, value) => {
    if (!product || !product.variants) return false;

    const testAttributes = { ...selectedAttributes };
    testAttributes[attributeName.toLowerCase()] = value;

    return product.variants.some((variant) => {
      return getAttributeTypes().every((attrType) => {
        const selectedValue = testAttributes[attrType];
        if (!selectedValue) return true;

        const variantAttr = variant.attributes?.find((attr) => attr.attribute_name.toLowerCase() === attrType);
        return variantAttr && variantAttr.value === selectedValue;
      });
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getCurrentPrice = () => {
    if (selectedVariant) {
      return selectedVariant.final_price;
    }
    return product.final_price;
  };

  const getCurrentOriginalPrice = () => {
    if (selectedVariant) {
      return selectedVariant.original_price;
    }
    return product.original_price;
  };

  const isInStock = () => {
    if (selectedVariant) {
      return selectedVariant.stock_quantity > 0;
    }
    return product.stock_quantity > 0;
  };

  const getCurrentStock = () => {
    if (selectedVariant) {
      return selectedVariant.stock_quantity;
    }
    return product.stock_quantity || 0;
  };

  return (
    <>
      <Button 
        type="text"
        icon={<ShoppingCartOutlined />}
        onClick={showModal}
      >
        Add to Cart
      </Button>

      <Modal
        title={`Add to Cart: ${product.name}`}
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={500}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3">
            <Image
              src={selectedVariant?.image_url || product.image_url || 'https://via.placeholder.com/200'}
              alt={product.name}
              className="object-cover rounded"
              preview={false}
            />
          </div>

          <div className="w-full md:w-2/3">
            <Title level={4}>{product.name}</Title>

            <div className="mb-4">
              <Text strong className="block mb-1">Price:</Text>
              <div>
                <Text className="text-lg text-red-600 font-bold">
                  {formatCurrency(getCurrentPrice())}
                </Text>
                {getCurrentOriginalPrice() > getCurrentPrice() && (
                  <Text delete className="ml-2 text-gray-500">
                    {formatCurrency(getCurrentOriginalPrice())}
                  </Text>
                )}
              </div>
            </div>

            {product.has_variant && getAttributeTypes().length > 0 && (
              <div className="mb-4">
                {getAttributeTypes().map((attrType) => (
                  <div key={attrType} className="mb-3">
                    <Text strong className="block mb-1">
                      {attrType.charAt(0).toUpperCase() + attrType.slice(1)}:
                    </Text>
                    <Select
                      placeholder={`Select ${attrType}`}
                      className="w-full"
                      value={selectedAttributes[attrType]}
                      onChange={(value) => handleSelectAttribute(attrType, value)}
                    >
                      {getUniqueAttributeValues(attrType).map((value) => {
                        const isAvailable = isAttributeValueAvailable(attrType, value);
                        return (
                          <Option key={value} value={value} disabled={!isAvailable}>
                            {value}
                          </Option>
                        );
                      })}
                    </Select>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-4">
              <Text strong className="block mb-1">Quantity:</Text>
              <InputNumber
                min={1}
                max={getCurrentStock()}
                value={quantity}
                onChange={(value) => setQuantity(value)}
                className="w-24"
                disabled={!isInStock()}
              />
              <Text className="ml-3 text-gray-500">
                {isInStock() ? `${getCurrentStock()} available` : 'Out of stock'}
              </Text>
            </div>

            <Divider className="my-3" />

            <div className="flex justify-between">
              <Text>Total:</Text>
              <Text strong className="text-red-600">
                {formatCurrency(getCurrentPrice() * quantity)}
              </Text>
            </div>

            <div className="mt-4 space-x-2">
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                disabled={!isInStock() || (product.has_variant && !selectedVariant)}
                loading={loading}
                block
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default QuickAddToCart;