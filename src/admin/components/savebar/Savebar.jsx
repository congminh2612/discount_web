import { Button } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';

const SaveBar = ({
  onSave,
  onDiscard,
  saveText = 'Lưu',
  discardText = 'Hủy',
  title = 'Chỉnh sửa sản phẩm',
  visible,
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className='fixed top-0 left-0 w-full bg-white shadow-md p-4 flex justify-between items-center z-50'
        >
          <span className='text-gray-700 font-medium'>{title}</span>
          <div className='space-x-2'>
            <Button
              onClick={onDiscard}
              className='bg-gray-500 text-white hover:bg-gray-600'
              shape='round'
            >
              {discardText}
            </Button>
            <Button
              onClick={onSave}
              className='bg-green-500 text-white hover:bg-green-600'
              shape='round'
            >
              {saveText}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default SaveBar;
