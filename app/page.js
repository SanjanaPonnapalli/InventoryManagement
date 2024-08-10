'use client'

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, MenuItem, Select, InputLabel, FormControl, IconButton } from '@mui/material';
import { firestore } from '@/firebase';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc, where } from 'firebase/firestore';
import { Add, Remove } from '@mui/icons-material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [price, setPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const categories = ['Books', 'Clothing', 'Electronics', 'Entertainment', 'Furniture', 'Groceries', 'Office Supplies', 'Personal Care', 'Tools', 'Other'];

  const updateInventory = async (category = 'All') => {
    let q;
    if (category === 'All') {
      q = query(collection(firestore, 'inventory'));
    } else {
      q = query(collection(firestore, 'inventory'), where('category', '==', category));
    }
    const snapshot = await getDocs(q);
    const inventoryList = [];
    snapshot.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
    setFilteredInventory(inventoryList); 
  };

  useEffect(() => {
    updateInventory(filterCategory);
  }, [filterCategory]);

  useEffect(() => {
    const results = inventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInventory(results);
  }, [searchTerm, inventory]);

  const addItem = async (item, quantity, category) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      await setDoc(docRef, { quantity: existingQuantity + quantity, category }, { merge: true });
    } else {
      await setDoc(docRef, { quantity, category });
    }
    await updateInventory(filterCategory);
  };

  const deleteItem = async (item) => {
    await deleteDoc(doc(collection(firestore, 'inventory'), item));
    await updateInventory(filterCategory);
  };

  const incrementQuantity = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 }, { merge: true });
    }
    await updateInventory(filterCategory);
  };

  const decrementQuantity = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity > 1) {
        await setDoc(docRef, { quantity: quantity - 1 }, { merge: true });
      } else {
        await deleteDoc(docRef);
      }
    }
    await updateInventory(filterCategory);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleEditOpen = async (itemName) => {
    const docRef = doc(collection(firestore, 'inventory'), itemName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setSelectedItem(itemName);
      setDescription(data.description || '');
      setPrice(data.price || '');
      setSupplier(data.supplier || '');
      setEditOpen(true);
    }
  };

  const handleEditClose = () => setEditOpen(false);

  return (
    <Box width="100vw" height="80vh" display={'flex'} flexDirection={'column'} alignItems={'center'}>
      <Box
        height="8%"
        width="100%"
        bgcolor={'#ADD8E6'}
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}
        padding={2}
        borderBottom={'1px solid #333'}
      >
        <Typography variant={'h5'} color={'#333'}>
          Inventory Management
        </Typography>
        <TextField
          id="search-item"
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
        />
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="item-name"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              sx={{ flex: 2 }}
            />
            <TextField
              id="item-quantity"
              label="Quantity"
              variant="outlined"
              type="number"
              fullWidth
              value={itemQuantity}
              onChange={(e) => setItemQuantity(e.target.value)}
              sx={{ flex: 1 }}
            />
            <FormControl fullWidth sx={{ flex: 1 }}>
              <InputLabel id="item-category">Category</InputLabel>
              <Select
                labelId="item-category"
                id="item-category"
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName, parseInt(itemQuantity) || 1, itemCategory);
                setItemName('');
                setItemQuantity('');
                setItemCategory('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal
        open={editOpen}
        onClose={handleEditClose}
        aria-labelledby="modal-edit-title"
        aria-describedby="modal-edit-description"
      >
        <Box sx={style}>
          <Typography id="modal-edit-title" variant="h6" component="h2">
            Edit Item Details
          </Typography>
          <TextField
            id="description"
            label="Description"
            variant="outlined"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            id="price"
            label="$Price"
            variant="outlined"
            type="number"
            fullWidth
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            id="supplier"
            label="Supplier"
            variant="outlined"
            fullWidth
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Button
            variant="contained"
            onClick={async () => {
              const docRef = doc(collection(firestore, 'inventory'), selectedItem);
              await setDoc(docRef, { description, price, supplier }, { merge: true });
              handleEditClose();
              await updateInventory(filterCategory);
            }}
          >
            Save
          </Button>
        </Box>
      </Modal>

      <Stack direction="row" spacing={2} alignItems="center" marginY={2}>
        <Button variant="contained" onClick={handleOpen}>
          Add New Item
        </Button>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="filter-category">Category</InputLabel>
          <Select
            labelId="filter-category"
            id="filter-category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            label="Category"
          >
            <MenuItem value="All">All</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Box border={'1px solid #333'}>
        <Box
          width="1100px"
          height="50px"
          bgcolor={'#ADD8E6'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Typography variant={'h5'} color={'#333'} textAlign={'center'}>
            Inventory
          </Typography>
        </Box>
        <Stack width="1100px" height="550px" overflow={'auto'}>
          {filteredInventory.map(({ name, quantity }, index) => (
            <Box
              key={name}
              width="100%"
              minHeight="50px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={ index % 2 === 0 ? '#f0f0f0' : 'white' }
              paddingX={5}
              paddingY={1}
            >
              <Typography variant={'h5'} color={'#333'} textAlign={'center'} onClick={() => handleEditOpen(name)} sx={{ cursor: 'pointer' }}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton onClick={() => decrementQuantity(name)}>
                  <Remove />
                </IconButton>
                <Typography variant={'h5'} color={'#333'} textAlign={'center'}>
                  {quantity}
                </Typography>
                <IconButton onClick={() => incrementQuantity(name)}>
                  <Add />
                </IconButton>
                <Button variant="contained" onClick={() => deleteItem(name)}>
                  Delete
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
