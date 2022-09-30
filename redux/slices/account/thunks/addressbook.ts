import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { arrayUnion } from "firebase/firestore";
import { IAddressBook } from "firebaseConfig";
import { RootState } from "redux/store";
import { FirestoreWrite } from "rpcHooks/useFirebase";



export const Set_Address_Book = createAsyncThunk<IAddressBook[], IAddressBook[]>("remoxData/Set_Address_Book", async (books, api) => {
    const state = api.getState() as RootState;
    const id = state.remoxData.storage?.individual.id;
    if (!id) throw new Error("No user id found");

    await FirestoreWrite().updateDoc("individuals", id, {
        addressBook: books
    })

    return books;
});

export const Add_Address_Book = createAsyncThunk<IAddressBook, IAddressBook>("remoxData/Add_Address_Book", async (book, api) => {
    const state = api.getState() as RootState;
    const id = state.remoxData.storage?.individual.id;
    if (!id) throw new Error("No user id found");

    await FirestoreWrite().updateDoc("individuals", id, {
        addressBook: arrayUnion(book)
    })

    return book;
});

export const Remove_Address_Book = createAsyncThunk<IAddressBook, IAddressBook>("remoxData/Remove_Address_Book", async (book, api) => {
    const state = api.getState() as RootState;
    const id = state.remoxData.storage?.individual.id;
    const books = state.remoxData.addressBook;
    if (!id) throw new Error("No user id found");

    await FirestoreWrite().updateDoc("individuals", id, {
        addressBook: books.filter(s => s.id !== book.id)
    })

    return book;
});