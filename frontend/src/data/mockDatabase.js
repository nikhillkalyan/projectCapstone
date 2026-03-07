// Mock Database - simulates backend/database
export const db = {
  students: [
    {
      id: 's1',
      name: 'Arjun Sharma',
      email: 'arjun@student.com',
      password: 'password123',
      role: 'student',
      college: 'IIT Madras',
      year: '3rd Year',
      interests: ['AIML', 'DataScience'],
      bio: 'Passionate about machine learning and data analytics.',
      avatar: null,
      enrolledCourses: ['c1', 'c2'],
      favoriteCourses: ['c3'],
      completedCourses: [],
      progress: {
        c1: {
          ch1: { completed: true, assessmentScore: 85, assessmentCompleted: true },
          ch2: { completed: true, assessmentScore: 90, assessmentCompleted: true },
          ch3: { completed: false }
        },
        c2: {
          ch4: { completed: true, assessmentScore: 75, assessmentCompleted: true }
        }
      },
      joinedAt: '2024-01-15'
    },
    {
      id: 's2',
      name: 'Priya Nair',
      email: 'priya@student.com',
      password: 'password123',
      role: 'student',
      college: 'NIT Trichy',
      year: '2nd Year',
      interests: ['Cloud', 'Cybersecurity'],
      bio: 'Interested in cloud architecture and ethical hacking.',
      avatar: null,
      enrolledCourses: ['c3'],
      favoriteCourses: ['c1'],
      completedCourses: [{ courseId: 'c4', score: 88, completedAt: '2024-03-01' }],
      progress: {
        c3: {
          ch7: { completed: true, assessmentScore: 92, assessmentCompleted: true }
        }
      },
      joinedAt: '2024-02-10'
    }
  ],

  instructors: [
    {
      id: 'i1',
      name: 'Dr. Ramesh Kumar',
      email: 'ramesh@instructor.com',
      password: 'password123',
      role: 'instructor',
      qualification: 'PhD in Computer Science, IIT Delhi',
      experience: '10 years in AI/ML research and industry',
      specialization: 'AIML',
      bio: 'Former Google Research Scientist. Published 30+ papers in ML.',
      avatar: null,
      courses: ['c1', 'c2'],
      rating: 4.8,
      totalStudents: 1240,
      joinedAt: '2023-06-01'
    },
    {
      id: 'i2',
      name: 'Meera Iyer',
      email: 'meera@instructor.com',
      password: 'password123',
      role: 'instructor',
      qualification: 'M.Tech in Cloud Computing, BITS Pilani',
      experience: '8 years as Cloud Solutions Architect at AWS',
      specialization: 'Cloud',
      bio: 'AWS Certified Solutions Architect. Built infrastructure for Fortune 500 companies.',
      avatar: null,
      courses: ['c3', 'c4'],
      rating: 4.9,
      totalStudents: 890,
      joinedAt: '2023-08-15'
    }
  ],

  courses: [
    {
      id: 'c1',
      title: 'Machine Learning Fundamentals',
      instructorId: 'i1',
      instructorName: 'Dr. Ramesh Kumar',
      category: 'AIML',
      level: 'Beginner',
      duration: '32 hours',
      thumbnail: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
      previewVideo: 'https://www.youtube.com/embed/Gv9_4yMHFhI',
      description: 'Master the core concepts of machine learning from scratch. Build real-world models using Python, scikit-learn, and TensorFlow.',
      longDescription: 'This comprehensive course covers supervised and unsupervised learning, neural networks, model evaluation, and deployment. You\'ll work on hands-on projects including sentiment analysis, image classification, and recommendation systems.',
      price: 'Free',
      rating: 4.7,
      enrolledCount: 1240,
      tags: ['Python', 'ML', 'TensorFlow', 'scikit-learn'],
      chapters: [
        {
          id: 'ch1',
          title: 'Introduction to Machine Learning',
          duration: '45 min',
          type: 'video',
          content: {
            videoUrl: 'https://www.youtube.com/embed/Gv9_4yMHFhI',
            description: 'Overview of ML, types of learning, and real-world applications.',
            textContent: `# Introduction to Machine Learning

Machine Learning (ML) is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.

## Types of Machine Learning

### 1. Supervised Learning
The algorithm learns from labeled training data:
- **Classification**: Predicting categories (spam/not spam)
- **Regression**: Predicting continuous values (house prices)

### 2. Unsupervised Learning  
Finding patterns in unlabeled data:
- **Clustering**: K-means, DBSCAN
- **Dimensionality Reduction**: PCA, t-SNE

### 3. Reinforcement Learning
Learning through rewards and penalties — used in game AI, robotics.

## Key Concepts
- **Features**: Input variables
- **Labels**: Output variables (in supervised learning)
- **Model**: Mathematical function mapping inputs to outputs
- **Training**: Optimizing model parameters on data
- **Inference**: Using trained model on new data

## Applications
- Image recognition
- Natural language processing
- Medical diagnosis
- Autonomous vehicles
- Recommendation systems`
          },
          assessment: {
            id: 'a1',
            questions: [
              {
                question: 'Which type of ML uses labeled training data?',
                options: ['Unsupervised Learning', 'Supervised Learning', 'Reinforcement Learning', 'Transfer Learning'],
                correct: 1
              },
              {
                question: 'What is the purpose of a training dataset?',
                options: ['To test the model', 'To deploy the model', 'To optimize model parameters', 'To visualize data'],
                correct: 2
              },
              {
                question: 'Which algorithm is used for clustering?',
                options: ['Linear Regression', 'K-means', 'Random Forest', 'SVM'],
                correct: 1
              },
              {
                question: 'Spam detection is an example of:',
                options: ['Regression', 'Clustering', 'Classification', 'Dimensionality Reduction'],
                correct: 2
              },
              {
                question: 'Reinforcement Learning learns through:',
                options: ['Labeled data', 'Unlabeled data', 'Rewards and penalties', 'Transfer learning'],
                correct: 2
              }
            ]
          }
        },
        {
          id: 'ch2',
          title: 'Linear Regression & Gradient Descent',
          duration: '60 min',
          type: 'text',
          content: {
            textContent: `# Linear Regression & Gradient Descent

## Linear Regression
Linear regression models the relationship between variables using a straight line.

**Equation**: y = mx + b
- y = prediction
- m = slope (weight)
- x = input feature
- b = intercept (bias)

## Cost Function
We use Mean Squared Error (MSE) to measure model error:
\`\`\`
MSE = (1/n) * Σ(predicted - actual)²
\`\`\`

## Gradient Descent
An optimization algorithm that minimizes the cost function:
1. Initialize weights randomly
2. Calculate gradient (derivative of cost w.r.t weights)
3. Update: w = w - α * gradient
4. Repeat until convergence

**α (alpha)** is the learning rate — controls step size.

## Python Implementation
\`\`\`python
from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2, 4, 5, 4, 5])

model = LinearRegression()
model.fit(X, y)
print(f"Slope: {model.coef_[0]:.2f}")
print(f"Intercept: {model.intercept_:.2f}")
\`\`\``
          },
          assessment: {
            id: 'a2',
            questions: [
              {
                question: 'In y = mx + b, what does "m" represent?',
                options: ['Intercept', 'Slope/Weight', 'Prediction', 'Cost'],
                correct: 1
              },
              {
                question: 'What does Gradient Descent minimize?',
                options: ['Learning Rate', 'Number of features', 'Cost function', 'Weights'],
                correct: 2
              },
              {
                question: 'What is the learning rate (alpha) in Gradient Descent?',
                options: ['Number of iterations', 'Step size for weight updates', 'Accuracy metric', 'Number of features'],
                correct: 1
              },
              {
                question: 'MSE stands for:',
                options: ['Maximum Squared Error', 'Mean Squared Error', 'Minimum Standard Error', 'Mean Standard Evaluation'],
                correct: 1
              },
              {
                question: 'What happens with too large a learning rate?',
                options: ['Converges faster', 'Never converges/diverges', 'Reduces overfitting', 'Better accuracy'],
                correct: 1
              }
            ]
          }
        },
        {
          id: 'ch3',
          title: 'Classification with Decision Trees',
          duration: '55 min',
          type: 'video',
          content: {
            videoUrl: 'https://www.youtube.com/embed/7VeUPuFGJHk',
            description: 'Learn decision tree algorithms and how to implement them.',
            textContent: `# Classification with Decision Trees

Decision Trees are intuitive models that split data based on feature values.

## Key Concepts
- **Root Node**: Starting point
- **Internal Nodes**: Decision points based on features
- **Leaf Nodes**: Final predictions

## Splitting Criteria
- **Gini Impurity**: Measures class mixing
- **Information Gain (Entropy)**: Reduction in uncertainty

## Advantages
- Easy to interpret
- No feature scaling needed
- Handles both numerical and categorical data

## Disadvantages
- Prone to overfitting
- Unstable with small data changes

## Random Forest
Ensemble of decision trees — reduces overfitting by averaging multiple trees.`
          },
          assessment: {
            id: 'a3',
            questions: [
              {
                question: 'What is the starting point of a decision tree called?',
                options: ['Leaf Node', 'Internal Node', 'Root Node', 'Split Node'],
                correct: 2
              },
              {
                question: 'Which of these is a disadvantage of Decision Trees?',
                options: ['Hard to interpret', 'Requires feature scaling', 'Prone to overfitting', 'Cannot handle numerical data'],
                correct: 2
              },
              {
                question: 'Random Forest reduces overfitting by:',
                options: ['Using more features', 'Averaging multiple trees', 'Using larger learning rate', 'Removing outliers'],
                correct: 1
              },
              {
                question: 'Gini Impurity measures:',
                options: ['Model accuracy', 'Class mixing', 'Depth of tree', 'Number of features'],
                correct: 1
              },
              {
                question: 'Leaf nodes in a decision tree represent:',
                options: ['Features', 'Decision points', 'Final predictions', 'Splitting criteria'],
                correct: 2
              }
            ]
          }
        }
      ],
      grandAssessment: {
        id: 'ga1',
        title: 'Machine Learning Fundamentals - Grand Assessment',
        passingScore: 70,
        questions: [
          { question: 'Which is NOT a type of machine learning?', options: ['Supervised', 'Unsupervised', 'Reinforcement', 'Deterministic'], correct: 3 },
          { question: 'MSE is used as a cost function for:', options: ['Classification', 'Clustering', 'Regression', 'Reinforcement Learning'], correct: 2 },
          { question: 'What does PCA stand for?', options: ['Principal Component Analysis', 'Primary Classification Algorithm', 'Predictive Cluster Analysis', 'Pattern Component Adjustment'], correct: 0 },
          { question: 'Which algorithm creates multiple trees and averages them?', options: ['Decision Tree', 'Linear Regression', 'Random Forest', 'SVM'], correct: 2 },
          { question: 'The learning rate in gradient descent controls:', options: ['Model accuracy', 'Step size of weight updates', 'Number of features', 'Training data size'], correct: 1 },
          { question: 'Spam classification is an example of:', options: ['Regression', 'Unsupervised learning', 'Classification', 'Reinforcement learning'], correct: 2 },
          { question: 'Which scoring metric is MSE?', options: ['Classification metric', 'Regression metric', 'Clustering metric', 'RL metric'], correct: 1 },
          { question: 'Features in ML are:', options: ['Output variables', 'Input variables', 'Model parameters', 'Labels'], correct: 1 },
          { question: 'Gini impurity is used in:', options: ['Linear Regression', 'K-means', 'Decision Trees', 'Neural Networks'], correct: 2 },
          { question: 'What is inference in ML?', options: ['Training on data', 'Using trained model on new data', 'Evaluating cost function', 'Adjusting weights'], correct: 1 }
        ]
      },
      reviews: [
        { studentId: 's2', studentName: 'Priya Nair', rating: 5, review: 'Excellent course! Very clear explanations.', date: '2024-02-20' }
      ],
      createdAt: '2023-09-01',
      updatedAt: '2024-01-15'
    },
    {
      id: 'c2',
      title: 'Deep Learning with Neural Networks',
      instructorId: 'i1',
      instructorName: 'Dr. Ramesh Kumar',
      category: 'AIML',
      level: 'Intermediate',
      duration: '48 hours',
      thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80',
      previewVideo: 'https://www.youtube.com/embed/aircAruvnKk',
      description: 'Dive deep into neural networks, CNNs, RNNs, and transformers. Build production-ready deep learning models.',
      longDescription: 'From perceptrons to transformers, this course covers the full spectrum of deep learning. You\'ll implement neural networks from scratch and using PyTorch/TensorFlow.',
      price: 'Free',
      rating: 4.9,
      enrolledCount: 890,
      tags: ['PyTorch', 'TensorFlow', 'CNN', 'RNN', 'Transformers'],
      chapters: [
        {
          id: 'ch4',
          title: 'Introduction to Neural Networks',
          duration: '50 min',
          type: 'video',
          content: {
            videoUrl: 'https://www.youtube.com/embed/aircAruvnKk',
            description: 'Understanding perceptrons, activation functions, and feedforward networks.',
            textContent: `# Introduction to Neural Networks

Neural networks are inspired by biological neurons in the brain.

## The Perceptron
Basic unit of a neural network:
- Receives inputs
- Applies weights
- Sums weighted inputs
- Applies activation function
- Outputs result

## Activation Functions
- **ReLU**: max(0, x) — most common
- **Sigmoid**: 1/(1+e^-x) — for binary output
- **Softmax**: Probability distribution for multi-class
- **Tanh**: Scaled sigmoid

## Architecture
- **Input Layer**: Receives raw features
- **Hidden Layers**: Transform data
- **Output Layer**: Final prediction`
          },
          assessment: {
            id: 'a4',
            questions: [
              { question: 'What is the most commonly used activation function?', options: ['Sigmoid', 'Tanh', 'ReLU', 'Linear'], correct: 2 },
              { question: 'Which layer receives raw features?', options: ['Hidden Layer', 'Output Layer', 'Input Layer', 'Activation Layer'], correct: 2 },
              { question: 'Softmax is used for:', options: ['Binary classification', 'Regression', 'Multi-class classification', 'Clustering'], correct: 2 },
              { question: 'A perceptron is the basic unit of:', options: ['Decision Trees', 'Neural Networks', 'SVM', 'Linear Regression'], correct: 1 },
              { question: 'ReLU function returns:', options: ['max(0, x)', 'min(0, x)', '1/(1+e^-x)', 'e^x'], correct: 0 }
            ]
          }
        }
      ],
      grandAssessment: {
        id: 'ga2',
        title: 'Deep Learning Grand Assessment',
        passingScore: 70,
        questions: [
          { question: 'CNNs are primarily used for:', options: ['Text data', 'Time series', 'Image data', 'Tabular data'], correct: 2 },
          { question: 'RNNs are suitable for:', options: ['Image classification', 'Sequential data', 'Static data', 'Clustering'], correct: 1 },
          { question: 'Backpropagation updates:', options: ['Learning rate', 'Network weights', 'Input features', 'Output labels'], correct: 1 },
          { question: 'Dropout is used to prevent:', options: ['Underfitting', 'Overfitting', 'Slow training', 'Data imbalance'], correct: 1 },
          { question: 'Batch normalization:', options: ['Reduces neurons', 'Normalizes layer inputs', 'Increases learning rate', 'Removes features'], correct: 1 },
          { question: 'Transfer learning reuses:', options: ['Training data', 'Pre-trained weights', 'Test metrics', 'Random weights'], correct: 1 },
          { question: 'Adam optimizer combines:', options: ['SGD and RMSProp', 'SGD and Momentum', 'Momentum and RMSProp', 'RMSProp and Adagrad'], correct: 2 },
          { question: 'Transformer architecture uses:', options: ['Convolution', 'Recurrence', 'Self-attention', 'Pooling'], correct: 2 },
          { question: 'Epoch means:', options: ['Single sample pass', 'Full dataset pass', 'Batch update', 'Validation step'], correct: 1 },
          { question: 'GANs consist of:', options: ['Encoder and Decoder', 'Generator and Discriminator', 'Two Classifiers', 'Two Autoencoders'], correct: 1 }
        ]
      },
      reviews: [],
      createdAt: '2023-10-01',
      updatedAt: '2024-01-20'
    },
    {
      id: 'c3',
      title: 'AWS Cloud Architecture Masterclass',
      instructorId: 'i2',
      instructorName: 'Meera Iyer',
      category: 'Cloud',
      level: 'Intermediate',
      duration: '40 hours',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
      previewVideo: 'https://www.youtube.com/embed/a9__D53WsMs',
      description: 'Master AWS from EC2 to serverless. Build scalable, fault-tolerant cloud architectures.',
      longDescription: 'This course covers AWS core services, architectural best practices, security, cost optimization, and prepares you for the AWS Solutions Architect certification.',
      price: 'Free',
      rating: 4.9,
      enrolledCount: 670,
      tags: ['AWS', 'EC2', 'S3', 'Lambda', 'Kubernetes'],
      chapters: [
        {
          id: 'ch7',
          title: 'AWS Core Services Overview',
          duration: '60 min',
          type: 'text',
          content: {
            textContent: `# AWS Core Services Overview

Amazon Web Services (AWS) provides over 200 fully featured services from data centers globally.

## Compute Services
- **EC2**: Virtual servers in the cloud
- **Lambda**: Serverless compute — run code without managing servers
- **ECS/EKS**: Container orchestration

## Storage Services
- **S3**: Object storage — unlimited scalability
- **EBS**: Block storage for EC2
- **Glacier**: Archival storage

## Database Services
- **RDS**: Managed relational databases
- **DynamoDB**: NoSQL, key-value
- **Redshift**: Data warehousing

## Networking
- **VPC**: Isolated virtual network
- **CloudFront**: CDN for low-latency content
- **Route 53**: DNS service

## Security
- **IAM**: Identity and Access Management
- **KMS**: Key Management Service
- **Shield**: DDoS protection`
          },
          assessment: {
            id: 'a7',
            questions: [
              { question: 'Which AWS service is serverless compute?', options: ['EC2', 'ECS', 'Lambda', 'Batch'], correct: 2 },
              { question: 'S3 is used for:', options: ['Compute', 'Object Storage', 'Networking', 'Database'], correct: 1 },
              { question: 'IAM stands for:', options: ['Internet Access Management', 'Identity and Access Management', 'Internal Application Manager', 'Infrastructure as Module'], correct: 1 },
              { question: 'DynamoDB is a:', options: ['Relational Database', 'NoSQL Database', 'Data Warehouse', 'File System'], correct: 1 },
              { question: 'CloudFront is a:', options: ['Server', 'CDN', 'Database', 'Firewall'], correct: 1 }
            ]
          }
        }
      ],
      grandAssessment: {
        id: 'ga3',
        title: 'AWS Cloud Architecture Grand Assessment',
        passingScore: 70,
        questions: [
          { question: 'EC2 instances run in:', options: ['S3 buckets', 'VPCs', 'CloudFront', 'Route 53'], correct: 1 },
          { question: 'Auto Scaling ensures:', options: ['Cost increases', 'Manual scaling', 'Automatic capacity adjustment', 'Fixed instances'], correct: 2 },
          { question: 'What is the AWS shared responsibility model?', options: ['AWS handles everything', 'Customer handles everything', 'Shared security duties', 'No security needed'], correct: 2 },
          { question: 'RDS supports:', options: ['Only MySQL', 'Only PostgreSQL', 'Multiple SQL engines', 'Only NoSQL'], correct: 2 },
          { question: 'Lambda billing is based on:', options: ['Fixed monthly fee', 'Requests and compute time', 'Server size', 'Region'], correct: 1 },
          { question: 'VPC stands for:', options: ['Virtual Private Cloud', 'Virtual Public Cluster', 'Variable Processing Core', 'Virtual Protocol Component'], correct: 0 },
          { question: 'Which service provides CDN?', options: ['EC2', 'S3', 'CloudFront', 'Route 53'], correct: 2 },
          { question: 'Glacier is for:', options: ['Real-time data', 'Archival storage', 'Compute', 'Database'], correct: 1 },
          { question: 'EKS is for:', options: ['Storage', 'Kubernetes orchestration', 'DNS', 'Monitoring'], correct: 1 },
          { question: 'Shield protects against:', options: ['Data loss', 'DDoS attacks', 'SQL injection', 'Phishing'], correct: 1 }
        ]
      },
      reviews: [
        { studentId: 's1', studentName: 'Arjun Sharma', rating: 5, review: 'Best cloud course I\'ve taken!', date: '2024-02-15' }
      ],
      createdAt: '2023-11-01',
      updatedAt: '2024-01-10'
    },
    {
      id: 'c4',
      title: 'Cybersecurity Fundamentals',
      instructorId: 'i2',
      instructorName: 'Meera Iyer',
      category: 'Cybersecurity',
      level: 'Beginner',
      duration: '28 hours',
      thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80',
      previewVideo: 'https://www.youtube.com/embed/hpn0jUf3gUg',
      description: 'Learn ethical hacking, network security, cryptography, and defense strategies from industry experts.',
      longDescription: 'Covers OWASP Top 10, penetration testing, network security, cryptography, and incident response. Prepares for CompTIA Security+ certification.',
      price: 'Free',
      rating: 4.8,
      enrolledCount: 540,
      tags: ['Ethical Hacking', 'Network Security', 'Cryptography', 'OWASP'],
      chapters: [
        {
          id: 'ch10',
          title: 'Introduction to Cybersecurity',
          duration: '45 min',
          type: 'text',
          content: {
            textContent: `# Introduction to Cybersecurity

Cybersecurity protects systems, networks, and programs from digital attacks.

## CIA Triad
- **Confidentiality**: Only authorized access
- **Integrity**: Data accuracy and trustworthiness
- **Availability**: Systems accessible when needed

## Types of Threats
- **Malware**: Viruses, trojans, ransomware
- **Phishing**: Social engineering attacks
- **Man-in-the-Middle**: Intercepting communications
- **DDoS**: Overwhelming systems with traffic
- **SQL Injection**: Exploiting database queries

## Defense Strategies
- Strong authentication (MFA)
- Regular patching and updates
- Network segmentation
- Security awareness training
- Incident response planning

## Career Paths
- Security Analyst
- Penetration Tester
- Security Engineer
- CISO`
          },
          assessment: {
            id: 'a10',
            questions: [
              { question: 'What does CIA stand for in cybersecurity?', options: ['Central Intelligence Agency', 'Confidentiality, Integrity, Availability', 'Computer, Internet, Application', 'Cloud, Infrastructure, Architecture'], correct: 1 },
              { question: 'Ransomware is a type of:', options: ['Hardware', 'Network', 'Malware', 'Protocol'], correct: 2 },
              { question: 'MFA stands for:', options: ['Multiple Feature Access', 'Multi-Factor Authentication', 'Main Firewall Application', 'Managed File Access'], correct: 1 },
              { question: 'SQL Injection targets:', options: ['Network traffic', 'Operating systems', 'Database queries', 'Encryption keys'], correct: 2 },
              { question: 'DDoS stands for:', options: ['Data Driven OS Security', 'Distributed Denial of Service', 'Dynamic Data Over SSL', 'Direct Denial of Software'], correct: 1 }
            ]
          }
        }
      ],
      grandAssessment: {
        id: 'ga4',
        title: 'Cybersecurity Fundamentals Grand Assessment',
        passingScore: 70,
        questions: [
          { question: 'Phishing is an example of:', options: ['Network attack', 'Social engineering', 'Physical attack', 'Malware'], correct: 1 },
          { question: 'Which is NOT part of the CIA triad?', options: ['Confidentiality', 'Integrity', 'Availability', 'Authenticity'], correct: 3 },
          { question: 'Penetration testing is also called:', options: ['Vulnerability scanning', 'Ethical hacking', 'Risk assessment', 'Security audit'], correct: 1 },
          { question: 'HTTPS uses:', options: ['HTTP only', 'SSL/TLS encryption', 'No encryption', 'FTP'], correct: 1 },
          { question: 'A firewall controls:', options: ['User access', 'Network traffic', 'File storage', 'CPU usage'], correct: 1 },
          { question: 'Zero-day vulnerability is:', options: ['Old known bug', 'Unknown flaw with no patch', 'Day-zero attack', 'Minor bug'], correct: 1 },
          { question: 'Encryption converts data to:', options: ['Plain text', 'Ciphertext', 'Binary', 'Hash'], correct: 1 },
          { question: 'VPN stands for:', options: ['Virtual Private Network', 'Virtual Public Node', 'Very Protected Network', 'Variable Port Number'], correct: 0 },
          { question: 'IDS stands for:', options: ['Internet Data Service', 'Intrusion Detection System', 'Internal Database System', 'Integrated Defense Solution'], correct: 1 },
          { question: 'Social engineering exploits:', options: ['Software bugs', 'Hardware flaws', 'Human psychology', 'Network protocols'], correct: 2 }
        ]
      },
      reviews: [],
      createdAt: '2024-01-05',
      updatedAt: '2024-02-01'
    },
    {
      id: 'c5',
      title: 'Data Science with Python',
      instructorId: 'i1',
      instructorName: 'Dr. Ramesh Kumar',
      category: 'DataScience',
      level: 'Beginner',
      duration: '36 hours',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
      previewVideo: 'https://www.youtube.com/embed/ua-CiDNNj30',
      description: 'Complete data science bootcamp covering pandas, numpy, matplotlib, and statistical analysis.',
      longDescription: 'From data collection to storytelling with data. Learn EDA, feature engineering, statistical testing, and visualization using Python\'s data science stack.',
      price: 'Free',
      rating: 4.6,
      enrolledCount: 1100,
      tags: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Statistics'],
      chapters: [
        {
          id: 'ch13',
          title: 'Python for Data Science',
          duration: '55 min',
          type: 'text',
          content: {
            textContent: `# Python for Data Science

Python is the de-facto language for data science due to its rich ecosystem.

## Essential Libraries

### NumPy
Numerical computing with N-dimensional arrays:
\`\`\`python
import numpy as np
arr = np.array([1, 2, 3, 4, 5])
print(arr.mean())  # 3.0
print(arr.std())   # 1.41
\`\`\`

### Pandas
Data manipulation and analysis:
\`\`\`python
import pandas as pd
df = pd.read_csv('data.csv')
print(df.describe())
print(df.isnull().sum())
\`\`\`

### Matplotlib/Seaborn
Data visualization:
\`\`\`python
import matplotlib.pyplot as plt
import seaborn as sns

plt.hist(df['age'], bins=20)
plt.title('Age Distribution')
plt.show()
\`\`\`

## Data Science Workflow
1. Data Collection
2. Data Cleaning
3. Exploratory Data Analysis (EDA)
4. Feature Engineering
5. Modeling
6. Evaluation
7. Deployment`
          },
          assessment: {
            id: 'a13',
            questions: [
              { question: 'Which library is used for N-dimensional arrays?', options: ['Pandas', 'Matplotlib', 'NumPy', 'Seaborn'], correct: 2 },
              { question: 'Pandas is primarily used for:', options: ['Machine learning', 'Data manipulation', 'Visualization', 'Deep learning'], correct: 1 },
              { question: 'EDA stands for:', options: ['Enhanced Data Analysis', 'Exploratory Data Analysis', 'Extended Data Approach', 'Efficient Data Algorithm'], correct: 1 },
              { question: 'Which function reads CSV files in Pandas?', options: ['pd.load_csv()', 'pd.open_csv()', 'pd.read_csv()', 'pd.import_csv()'], correct: 2 },
              { question: 'Feature engineering involves:', options: ['Collecting raw data', 'Creating new features', 'Model deployment', 'Data deletion'], correct: 1 }
            ]
          }
        }
      ],
      grandAssessment: {
        id: 'ga5',
        title: 'Data Science Grand Assessment',
        passingScore: 70,
        questions: [
          { question: 'Which is used for statistical visualization?', options: ['NumPy', 'Pandas', 'Seaborn', 'Scikit-learn'], correct: 2 },
          { question: 'Data cleaning handles:', options: ['Model tuning', 'Missing values and outliers', 'Feature selection only', 'Model training'], correct: 1 },
          { question: 'Correlation measures:', options: ['Causation', 'Relationship between variables', 'Data size', 'Model accuracy'], correct: 1 },
          { question: 'A histogram shows:', options: ['Correlation', 'Distribution of data', 'Time series', 'Network graph'], correct: 1 },
          { question: 'df.describe() shows:', options: ['First 5 rows', 'Last 5 rows', 'Statistical summary', 'Data types'], correct: 2 },
          { question: 'Outliers are:', options: ['Normal data points', 'Missing values', 'Extreme values', 'Duplicates'], correct: 2 },
          { question: 'One-hot encoding converts:', options: ['Numbers to text', 'Categorical to numerical', 'Images to arrays', 'Text to vectors'], correct: 1 },
          { question: 'P-value in hypothesis testing:', options: ['Correlation coefficient', 'Probability of null hypothesis', 'Mean value', 'Standard deviation'], correct: 1 },
          { question: 'Box plot shows:', options: ['Trends over time', 'Distribution and outliers', 'Network topology', 'Feature importance'], correct: 1 },
          { question: 'Cross-validation prevents:', options: ['Underfitting only', 'Data leakage and overfitting', 'Slow training', 'High bias'], correct: 1 }
        ]
      },
      reviews: [],
      createdAt: '2024-01-20',
      updatedAt: '2024-02-05'
    }
  ],

  messages: [
    {
      id: 'msg1',
      fromId: 's1',
      fromName: 'Arjun Sharma',
      fromRole: 'student',
      toId: 'i1',
      courseId: 'c1',
      message: 'Hello Dr. Ramesh! I am having trouble understanding gradient descent. Can you help?',
      timestamp: '2024-02-20T10:30:00',
      read: true
    },
    {
      id: 'msg2',
      fromId: 'i1',
      fromName: 'Dr. Ramesh Kumar',
      fromRole: 'instructor',
      toId: 's1',
      courseId: 'c1',
      message: 'Hi Arjun! Gradient descent can be tricky. Think of it as rolling a ball downhill — we always move in the direction that reduces the cost the most. The learning rate controls how big each step is.',
      timestamp: '2024-02-20T11:00:00',
      read: true
    }
  ],

  assessmentResults: {
    s1: {
      c1: {
        ch1: { score: 85, completedAt: '2024-02-10' },
        ch2: { score: 90, completedAt: '2024-02-12' }
      },
      c2: {
        ch4: { score: 75, completedAt: '2024-02-18' }
      }
    }
  }
};