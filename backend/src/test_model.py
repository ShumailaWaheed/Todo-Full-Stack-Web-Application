#!/usr/bin/env python3
"""Test script to check SQLModel definition"""

from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Task(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True)
    title: str = Field(default="")

if __name__ == "__main__":
    print("Model definition successful!")
    task = Task(title="Test task")
    print(f"Created task: {task}")