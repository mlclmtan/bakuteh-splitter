'use client';

import { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Select } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

const { TextArea } = Input;
const { Option } = Select;

interface Food {
  name: string;
  price: number;
  includedPeople: string[];
}

interface Person {
  name: string;
  amountToPay: string;
  foodPrice: number;
  gst: number;
  serviceTax: number;
}

const BillSplitter: React.FC = () => {
  const defaultFoodList = "ribsoup 99\nbeancurd 13.8\negg 3\nchoysim 9.5\nyoutiao 12\nrice 10.8\nbarley 5.1\nluohanguo 5\nlime 2.5";
  const defaultPeopleList = "Fanwei\nRonald\nPoh Feng\nShi Zheng\nKiefer\nChun Heng\nJacky\nEugene\nMalcolm";

  const [foodList, setFoodList] = useState<string>(defaultFoodList);
  const [peopleList, setPeopleList] = useState<string>(defaultPeopleList);
  const [gst, setGst] = useState<number>(0);
  const [serviceTax, setServiceTax] = useState<number>(0);
  const [billData, setBillData] = useState<Food[]>([]);
  const [billSummary, setBillSummary] = useState<Person[]>([]);

  useEffect(() => {
    // Function to update bill data
    const updateBillData = () => {
      // Parse food list
      const foods: Food[] = foodList.split('\n').map(food => {
        const [name, price] = food.split(' ');
        const includedPeople = peopleList.split('\n');
        return { name, price: parseFloat(price), includedPeople };
      });

      // Initialize bill data
      setBillData(foods);
    };

    // Trigger bill data update when food list changes
    updateBillData();
  }, [foodList, peopleList]);

  useEffect(() => {
    // Function to update bill summary
    const updateBillSummary = () => {
      // Parse people list
      const people: string[] = peopleList.split('\n');

      // Initialize bill summary
      const initialBillSummary: Person[] = people.map(person => ({
        name: person,
        amountToPay: "0",
        foodPrice: 0,
        gst,
        serviceTax
      }));

      // Calculate amount each person owes based on included foods
      const updatedBillSummary: Person[] = initialBillSummary.map(person => {
        const { amountToPay } = billData.reduce((acc, food) => {
          if (food.includedPeople.includes(person.name)) {
            acc.amountToPay += food.price / food.includedPeople.length;
          }
          return acc;
        }, { amountToPay: 0 });

        person.amountToPay = (((amountToPay + amountToPay * (gst / 100)) * (1 + serviceTax / 100))).toFixed(2);
        person.foodPrice = amountToPay;
        return person;
      });

      setBillSummary(updatedBillSummary);
    };

    // Trigger bill summary update when bill data or people list changes
    updateBillSummary();
  }, [billData, peopleList, gst, serviceTax]);

  const handleFoodListChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFoodList(e.target.value);
  };

  const handlePeopleListChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPeopleList(e.target.value);
  };

  const handleGstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGst(parseFloat(e.target.value));
  };

  const handleServiceTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServiceTax(parseFloat(e.target.value));
  };

  const handleClear = () => {
    setFoodList('');
    setPeopleList('');
    setGst(9);
    setServiceTax(10);
  };

  const handleSelectPeople = (foodIndex: number, selectedPeople: string[]) => {
    const updatedFoods: Food[] = [...billData];
    updatedFoods[foodIndex].includedPeople = selectedPeople;
    setBillData(updatedFoods);
  };

  const columns = [
    { title: 'Food', dataIndex: 'name', key: 'name' },
    {
      title: 'Select People',
      dataIndex: 'includedPeople',
      key: 'includedPeople',
      render: (includedPeople: string[], record: Food, index: number) => (
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Please select"
          value={includedPeople}
          onChange={(selectedPeople: string[]) => handleSelectPeople(index, selectedPeople)}
          allowClear
          showSearch={false}
        >
          {peopleList.split('\n').map((person, index) => (
            <Option key={index} value={person}>
              {person}
            </Option>
          ))}
        </Select>
      ),
    },
  ];

  const billSummaryColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', fixed: true },
    {
      title: 'Total Amount to Pay',
      dataIndex: 'amountToPay',
      key: 'amountToPay',
      fixed: true,
      render: (text: string, record: Person) => (
        <span style={{ textDecoration: record.amountToPay ? 'underline' : 'none' }}>{text}</span>
      )
    },
    { title: 'Untaxed Food Price', dataIndex: 'foodPrice', key: 'foodPrice', render: (text: number) => <span>{text.toFixed(2)}</span> },
    { title: 'GST', dataIndex: 'gst', key: 'gst' },
    { title: 'Service Tax', dataIndex: 'serviceTax', key: 'serviceTax' },
  ];

  return (
    <div className="bill-splitter-container">
      <div className="bill-splitter-inputs">
        <div className="bill-splitter-input">
          <h2>Enter Food List:</h2>
          <TextArea rows={Math.max(foodList.split('\n').length, 1)} value={foodList} onChange={handleFoodListChange} />
        </div>
        <div className="bill-splitter-input">
          <h2>Enter People List:</h2>
          <TextArea rows={Math.max(peopleList.split('\n').length, 1)} value={peopleList} onChange={handlePeopleListChange} />
        </div>
        <div className="bill-splitter-tax">
          <div className="bill-splitter-input">
            <h2>GST (%):</h2>
            <Input type="number" value={gst} onChange={handleGstChange} />
          </div>
          <div className="bill-splitter-input">
            <h2>Service Tax (%):</h2>
            <Input type="number" value={serviceTax} onChange={handleServiceTaxChange} />
          </div>
        </div>
      </div>
      <div className="bill-splitter-actions">
        <Space>
          <Button type="primary" onClick={handleClear}>Clear</Button>
        </Space>
      </div>
      <div className="bill-splitter-table">
        <h2>Select person to include:</h2>
        <Table
          columns={columns}
          dataSource={billData}
          pagination={false}
        />
      </div>
      <div className="bill-splitter-summary">
        <h2>Bill Summary:</h2>
        <Table
          columns={billSummaryColumns}
          dataSource={billSummary}
          pagination={false}
          scroll={{ x: true }}
        />
      </div>
      <div className='footer'>
        <a href="https://github.com/mlclmtan/bakuteh-splitter" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faGithub} style={{ fontSize: '30px' }} />
        </a>
      </div>
    </div>
  );
};

export default BillSplitter;
