import React from 'react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import StatusBadge from '../components/common/StatusBadge';
import { FiSave, FiTrash, FiEdit } from 'react-icons/fi';

function ComponentsDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Design System Components
          </h1>
          <p className="text-gray-600">Reusable components untuk sistem aduan</p>
        </div>

        {/* Buttons Section */}
        <Card title="Buttons" subtitle="Button variants & sizes">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button icon={<FiSave />}>Save</Button>
              <Button icon={<FiEdit />} variant="secondary">Edit</Button>
              <Button icon={<FiTrash />} variant="danger">Delete</Button>
            </div>
            
            <div className="flex gap-3">
              <Button loading>Loading...</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </Card>

        {/* Status Badges Section */}
        <Card title="Status Badges" subtitle="Complaint status indicators">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="pending" />
              <StatusBadge status="in_progress" />
              <StatusBadge status="completed" />
              <StatusBadge status="rejected" />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="pending" size="sm" />
              <StatusBadge status="completed" size="md" />
              <StatusBadge status="rejected" size="lg" />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="active" />
              <StatusBadge status="inactive" />
            </div>
          </div>
        </Card>

        {/* Inputs Section */}
        <Card title="Form Inputs" subtitle="Text inputs with validation">
          <div className="space-y-4">
            <Input 
              label="Email"
              type="email"
              placeholder="nama@example.com"
              helperText="Masukkan email valid"
            />
            
            <Input 
              label="Password"
              type="password"
              placeholder="••••••••"
              required
            />
            
            <Input 
              label="Error State"
              error="Email sudah terdaftar"
              value="test@test.com"
            />
            
            <Input 
              label="Disabled"
              disabled
              value="Cannot edit this"
            />
          </div>
        </Card>

        {/* Cards Section */}
        <Card 
          title="Card Component" 
          subtitle="Container with title & actions"
          actions={
            <>
              <Button size="sm" variant="outline">Cancel</Button>
              <Button size="sm">Save</Button>
            </>
          }
        >
          <p className="text-gray-600">
            This is a card component with title, subtitle, and action buttons.
            Perfect for organizing content sections!
          </p>
        </Card>

      </div>
    </div>
  );
}

export default ComponentsDemo;
